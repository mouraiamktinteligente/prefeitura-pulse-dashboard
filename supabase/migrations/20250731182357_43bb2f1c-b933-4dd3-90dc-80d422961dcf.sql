-- Criar função para logout forçado via browser
CREATE OR REPLACE FUNCTION public.force_logout_user(user_email text, motivo text DEFAULT 'browser_closed')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Desativar todas as sessões do usuário
  UPDATE public.sessoes_ativas 
  SET ativo = false, updated_at = now()
  WHERE user_email = force_logout_user.user_email AND ativo = true;
  
  -- Marcar usuário como desconectado
  UPDATE public.usuarios_sistema 
  SET status_conexao = 'desconectado'
  WHERE email = force_logout_user.user_email;
  
  -- Registrar no log de acesso
  UPDATE public.logs_acesso 
  SET data_hora_logout = now(), 
      status_conexao = force_logout_user.motivo,
      updated_at = now()
  WHERE email_usuario = force_logout_user.user_email 
    AND data_hora_logout IS NULL;
END;
$$;