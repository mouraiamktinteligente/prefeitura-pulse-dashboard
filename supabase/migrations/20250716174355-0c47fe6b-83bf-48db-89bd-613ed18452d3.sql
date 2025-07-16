-- Corrigir o trigger para NÃO desconectar sessão existente, apenas bloquear nova tentativa
-- Modificar função para verificar PRIMEIRO e rejeitar SEM desativar sessões existentes

DROP TRIGGER IF EXISTS enforce_single_session_trigger ON public.sessoes_ativas;

CREATE OR REPLACE FUNCTION public.enforce_single_session_per_user()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Normalizar email para evitar problemas de case sensitivity
  NEW.user_email = TRIM(LOWER(NEW.user_email));
  
  -- Se está inserindo uma nova sessão ativa
  IF NEW.ativo = true THEN
    -- VERIFICAR se já existe sessão ativa ANTES de fazer qualquer alteração
    IF EXISTS (
      SELECT 1 FROM public.sessoes_ativas 
      WHERE TRIM(LOWER(user_email)) = NEW.user_email 
        AND id != NEW.id 
        AND ativo = true
        AND (last_activity + '15 minutes'::interval) > now()  -- Ainda não expirou por inatividade
    ) THEN
      -- REJEITAR a nova tentativa SEM tocar na sessão existente
      RAISE EXCEPTION 'USUARIO_JA_CONECTADO: Este usuário já está conectado. Para ter acesso, utilize outro login e senha.';
    END IF;
    
    -- Se chegou até aqui, pode criar a sessão (não há conflito)
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recriar o trigger
CREATE TRIGGER enforce_single_session_trigger
  BEFORE INSERT ON public.sessoes_ativas
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_single_session_per_user();

-- Modificar o trigger de sincronização para ser mais inteligente
CREATE OR REPLACE FUNCTION public.sync_user_status_on_session_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Quando uma sessão é desativada, verificar se ainda há outras sessões ativas
  IF NEW.ativo = false AND OLD.ativo = true THEN
    -- Só marcar como desconectado se NÃO há mais nenhuma sessão ativa
    IF NOT EXISTS (
      SELECT 1 FROM public.sessoes_ativas 
      WHERE TRIM(LOWER(user_email)) = TRIM(LOWER(NEW.user_email))
        AND ativo = true
        AND id != NEW.id
    ) THEN
      UPDATE public.usuarios_sistema 
      SET status_conexao = 'desconectado'
      WHERE TRIM(LOWER(email)) = TRIM(LOWER(NEW.user_email));
    END IF;
  END IF;
  
  -- Quando uma sessão é ativada, marcar usuário como conectado
  IF NEW.ativo = true AND (OLD.ativo = false OR OLD.ativo IS NULL) THEN
    UPDATE public.usuarios_sistema 
    SET status_conexao = 'conectado'
    WHERE TRIM(LOWER(email)) = TRIM(LOWER(NEW.user_email));
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Comentários explicativos
COMMENT ON FUNCTION public.enforce_single_session_per_user() IS 'Bloqueia tentativa de segunda sessão SEM desconectar a sessão existente - preserva usuário já conectado';
COMMENT ON FUNCTION public.sync_user_status_on_session_change() IS 'Sincroniza status apenas quando não há mais sessões ativas - evita desconexão prematura';