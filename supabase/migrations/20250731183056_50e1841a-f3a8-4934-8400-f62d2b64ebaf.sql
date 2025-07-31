-- Criar função de limpeza que usa valores válidos de status_conexao
CREATE OR REPLACE FUNCTION public.force_logout_user(p_user_email text, p_motivo text DEFAULT 'logout')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Desativar todas as sessões do usuário
  UPDATE public.sessoes_ativas 
  SET ativo = false, updated_at = now()
  WHERE user_email = p_user_email AND ativo = true;
  
  -- Marcar usuário como desconectado
  UPDATE public.usuarios_sistema 
  SET status_conexao = 'desconectado'
  WHERE email = p_user_email;
  
  -- Registrar no log de acesso (usando apenas valores válidos)
  UPDATE public.logs_acesso 
  SET data_hora_logout = now(), 
      status_conexao = CASE 
        WHEN p_motivo IN ('login', 'logout', 'desconectado_admin', 'timeout', 'erro_sessao') THEN p_motivo
        ELSE 'logout'
      END,
      updated_at = now()
  WHERE email_usuario = p_user_email 
    AND data_hora_logout IS NULL;
END;
$$;