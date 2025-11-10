-- Função para fechar logs órfãos (sem logout) que não correspondem à sessão ativa
CREATE OR REPLACE FUNCTION cleanup_orphan_access_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Fechar todos os logs sem logout que não têm sessão ativa correspondente
  UPDATE logs_acesso
  SET 
    data_hora_logout = NOW(),
    updated_at = NOW(),
    status_conexao = 'timeout'
  WHERE 
    data_hora_logout IS NULL
    AND NOT EXISTS (
      SELECT 1 
      FROM sessoes_ativas sa
      WHERE sa.user_email = logs_acesso.email_usuario
        AND sa.ativo = true
    );
    
  -- Fechar logs muito antigos (mais de 7 dias sem atividade)
  UPDATE logs_acesso
  SET 
    data_hora_logout = NOW(),
    updated_at = NOW(),
    status_conexao = 'timeout'
  WHERE 
    data_hora_logout IS NULL
    AND data_hora_login < NOW() - INTERVAL '7 days';
END;
$$;