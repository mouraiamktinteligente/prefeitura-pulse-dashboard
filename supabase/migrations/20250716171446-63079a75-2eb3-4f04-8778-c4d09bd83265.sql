-- Remover constraint única anterior se existir
DROP INDEX IF EXISTS idx_unique_active_session;

-- Criar função mais robusta para garantir sessão única
CREATE OR REPLACE FUNCTION public.enforce_single_session_per_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Normalizar email para evitar problemas de case sensitivity
  NEW.user_email = TRIM(LOWER(NEW.user_email));
  
  -- Se está inserindo uma nova sessão ativa
  IF NEW.ativo = true THEN
    -- Primeiro, desativar TODAS as outras sessões ativas deste usuário
    UPDATE public.sessoes_ativas 
    SET ativo = false, updated_at = now()
    WHERE TRIM(LOWER(user_email)) = NEW.user_email 
      AND id != NEW.id 
      AND ativo = true;
      
    -- Verificar se ainda existe alguma sessão ativa após o update
    -- (proteção contra race conditions)
    IF EXISTS (
      SELECT 1 FROM public.sessoes_ativas 
      WHERE TRIM(LOWER(user_email)) = NEW.user_email 
        AND id != NEW.id 
        AND ativo = true
    ) THEN
      RAISE EXCEPTION 'USUARIO_JA_CONECTADO: Usuário % já possui sessão ativa', NEW.user_email;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger anterior se existir
DROP TRIGGER IF EXISTS trigger_enforce_single_session ON public.sessoes_ativas;

-- Criar trigger BEFORE INSERT para bloquear inserções simultâneas
CREATE TRIGGER trigger_enforce_single_session
  BEFORE INSERT ON public.sessoes_ativas
  FOR EACH ROW 
  EXECUTE FUNCTION public.enforce_single_session_per_user();

-- Criar constraint única mais robusta que considera emails normalizados
CREATE UNIQUE INDEX idx_unique_active_session_normalized 
ON public.sessoes_ativas (TRIM(LOWER(user_email))) 
WHERE ativo = true;

-- Atualizar função de status do usuário para ser mais robusta
CREATE OR REPLACE FUNCTION public.sync_user_status_on_session_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando uma sessão é desativada, marcar usuário como desconectado
  IF NEW.ativo = false AND OLD.ativo = true THEN
    UPDATE public.usuarios_sistema 
    SET status_conexao = 'desconectado'
    WHERE TRIM(LOWER(email)) = TRIM(LOWER(NEW.user_email));
  END IF;
  
  -- Quando uma sessão é ativada, marcar usuário como conectado
  IF NEW.ativo = true AND OLD.ativo = false THEN
    UPDATE public.usuarios_sistema 
    SET status_conexao = 'conectado'
    WHERE TRIM(LOWER(email)) = TRIM(LOWER(NEW.user_email));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger anterior e criar novo
DROP TRIGGER IF EXISTS trigger_sync_user_status ON public.sessoes_ativas;
CREATE TRIGGER trigger_sync_user_status
  AFTER UPDATE ON public.sessoes_ativas
  FOR EACH ROW 
  EXECUTE FUNCTION public.sync_user_status_on_session_change();

-- Limpar sessões inconsistentes existentes (manter apenas a mais recente por usuário)
WITH ranked_sessions AS (
  SELECT id, user_email, 
         ROW_NUMBER() OVER (PARTITION BY TRIM(LOWER(user_email)) ORDER BY created_at DESC) as rn
  FROM public.sessoes_ativas 
  WHERE ativo = true
)
UPDATE public.sessoes_ativas 
SET ativo = false, updated_at = now()
WHERE id IN (
  SELECT id FROM ranked_sessions WHERE rn > 1
);