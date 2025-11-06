-- Habilitar RLS na tabela resumo_whatsapp
ALTER TABLE resumo_whatsapp ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura aos usuários com sessão ativa
CREATE POLICY "Usuários autenticados podem visualizar resumos WhatsApp"
ON resumo_whatsapp
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM sessoes_ativas sa
    JOIN usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true 
      AND sa.expires_at > now() 
      AND us.ativo = true
  )
);