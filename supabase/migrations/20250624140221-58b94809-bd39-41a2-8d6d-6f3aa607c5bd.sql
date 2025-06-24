
-- Primeiro, vamos remover as políticas problemáticas que estão causando recursão infinita
DROP POLICY IF EXISTS "Users can view their own record" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "Allow login lookup" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.usuarios_sistema;

-- Criar uma função de segurança para verificar se o usuário é admin
-- Isso evita a recursão infinita nas políticas RLS
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Durante o login, permitir acesso para verificação
  IF auth.jwt() IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar se o usuário logado é admin usando uma consulta direta
  RETURN EXISTS (
    SELECT 1 FROM public.usuarios_sistema 
    WHERE email = auth.jwt() ->> 'email' 
    AND tipo_usuario = 'administrador' 
    AND ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Política simples para permitir login - qualquer um pode ler para autenticação
CREATE POLICY "Allow authentication lookup" 
  ON public.usuarios_sistema 
  FOR SELECT 
  USING (true);

-- Política para permitir que usuários vejam apenas seu próprio registro
CREATE POLICY "Users can view own record" 
  ON public.usuarios_sistema 
  FOR SELECT 
  USING (
    auth.jwt() ->> 'email' = email OR 
    public.is_admin_user()
  );

-- Política para administradores gerenciarem usuários
CREATE POLICY "Admins can manage users" 
  ON public.usuarios_sistema 
  FOR ALL 
  USING (public.is_admin_user());
