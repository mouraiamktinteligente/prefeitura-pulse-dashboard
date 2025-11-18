-- Criar política RLS para resumo_radio
CREATE POLICY "Usuários autenticados podem visualizar resumos Rádio"
ON public.resumo_radio
FOR SELECT
TO public
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

-- Criar política RLS para resumo_web
CREATE POLICY "Usuários autenticados podem visualizar resumos Web"
ON public.resumo_web
FOR SELECT
TO public
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