-- Corrigir a configuração de sessão para 15 minutos de inatividade real
-- Modificar a função renovar_sessao para ser baseada em inatividade de 15 minutos

CREATE OR REPLACE FUNCTION public.renovar_sessao(p_user_email text, p_session_token uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Verificar se a sessão ainda é válida (não expirou por inatividade de 15 minutos)
  UPDATE public.sessoes_ativas
  SET 
    last_activity = now(),
    expires_at = now() + '15 minutes'::interval,  -- Nova atividade = mais 15 minutos
    updated_at = now()
  WHERE user_email = p_user_email 
    AND session_token = p_session_token 
    AND ativo = true
    AND (last_activity + '15 minutes'::interval) > now();  -- Só renova se não passou de 15 min de inatividade
    
  RETURN FOUND;
END;
$function$;

-- Modificar a função de limpeza para considerar 15 minutos de inatividade
CREATE OR REPLACE FUNCTION public.limpar_sessoes_expiradas()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Desativar sessões que ficaram inativas por mais de 15 minutos
  UPDATE public.sessoes_ativas 
  SET ativo = false, updated_at = now()
  WHERE (last_activity + '15 minutes'::interval) < now() AND ativo = true;
  
  -- Marcar usuários com sessões expiradas como desconectados
  UPDATE public.usuarios_sistema 
  SET status_conexao = 'desconectado'
  WHERE email IN (
    SELECT DISTINCT user_email 
    FROM public.sessoes_ativas 
    WHERE (last_activity + '15 minutes'::interval) < now() AND ativo = false 
    AND updated_at > now() - interval '1 minute'
  );
END;
$function$;

-- Alterar o default da expires_at para ser 15 minutos ao invés de 4 horas
ALTER TABLE public.sessoes_ativas 
ALTER COLUMN expires_at SET DEFAULT (now() + '15 minutes'::interval);

-- Comentários para explicar as mudanças
COMMENT ON FUNCTION public.renovar_sessao(text, uuid) IS 'Renova sessão baseada em inatividade de 15 minutos - só renova se usuário esteve ativo nos últimos 15 minutos';
COMMENT ON FUNCTION public.limpar_sessoes_expiradas() IS 'Limpa sessões que ficaram inativas por mais de 15 minutos';