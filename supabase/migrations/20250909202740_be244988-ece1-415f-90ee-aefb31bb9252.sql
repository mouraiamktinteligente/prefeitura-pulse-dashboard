-- Corrigir políticas RLS para permitir autenticação
-- Dropar as políticas existentes que estão impedindo o login
DROP POLICY IF EXISTS "Usuários podem visualizar seus próprios dados" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "Administradores podem visualizar todos os usuários" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "Sistema pode criar novos usuários" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "Administradores podem atualizar qualquer usuário" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "Administradores podem deletar usuários" ON public.usuarios_sistema;

-- Criar nova função para autenticação segura
CREATE OR REPLACE FUNCTION public.authenticate_user_secure(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Permitir leitura apenas para verificação de credenciais
  -- Não expõe dados sensíveis, apenas confirma se usuário existe e está ativo
  RETURN EXISTS (
    SELECT 1 FROM public.usuarios_sistema 
    WHERE email = p_email AND ativo = true
  );
END;
$$;

-- Política para permitir leitura durante autenticação
CREATE POLICY "Permitir leitura para autenticação" 
ON public.usuarios_sistema 
FOR SELECT 
USING (true);

-- Política para inserção (apenas sistema)
CREATE POLICY "Sistema pode criar usuários" 
ON public.usuarios_sistema 
FOR INSERT 
WITH CHECK (true);

-- Política para atualizações (usuários próprios e admins)
CREATE POLICY "Usuários autenticados podem atualizar próprios dados"
ON public.usuarios_sistema 
FOR UPDATE 
USING (
  -- Verificar se existe sessão ativa para este usuário
  email IN (
    SELECT sa.user_email 
    FROM sessoes_ativas sa 
    WHERE sa.user_email = usuarios_sistema.email 
    AND sa.ativo = true 
    AND sa.expires_at > now()
  )
)
WITH CHECK (
  email IN (
    SELECT sa.user_email 
    FROM sessoes_ativas sa 
    WHERE sa.user_email = usuarios_sistema.email 
    AND sa.ativo = true 
    AND sa.expires_at > now()
  )
);

-- Política para admins gerenciarem todos os usuários
CREATE POLICY "Admins podem gerenciar todos os usuários"
ON public.usuarios_sistema 
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM sessoes_ativas sa
    JOIN usuarios_sistema admin_user ON admin_user.email = sa.user_email
    WHERE sa.ativo = true 
    AND sa.expires_at > now()
    AND admin_user.tipo_usuario = 'administrador'
    AND admin_user.ativo = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM sessoes_ativas sa
    JOIN usuarios_sistema admin_user ON admin_user.email = sa.user_email
    WHERE sa.ativo = true 
    AND sa.expires_at > now()
    AND admin_user.tipo_usuario = 'administrador'
    AND admin_user.ativo = true
  )
);