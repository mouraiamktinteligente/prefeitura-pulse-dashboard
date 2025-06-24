
-- Primeiro, remover as políticas que dependem da função is_admin_user()
DROP POLICY IF EXISTS "Users can view own record" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "Admins can manage users" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "Allow authentication lookup" ON public.usuarios_sistema;

-- Agora podemos remover a função sem problemas
DROP FUNCTION IF EXISTS public.is_admin_user() CASCADE;

-- Remover qualquer outra política restante
DROP POLICY IF EXISTS "Administradores podem ver todos os usuários" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "Usuários podem ver próprios dados" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "Administradores podem inserir usuários" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "Administradores podem atualizar usuários" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "Administradores podem deletar usuários" ON public.usuarios_sistema;

-- Criar uma política simples para permitir acesso durante login/verificação
-- Esta política permite que qualquer usuário autenticado veja registros que correspondem ao seu email
CREATE POLICY "allow_user_access" 
ON public.usuarios_sistema 
FOR SELECT 
USING (
  -- Permitir acesso se o usuário está logado e o email corresponde
  (auth.uid() IS NOT NULL AND email = (auth.jwt() ->> 'email')) OR
  -- OU se é um usuário admin (verificação direta sem recursão)
  (auth.uid() IS NOT NULL AND 
   email IN (
     SELECT u.email FROM public.usuarios_sistema u 
     WHERE u.email = (auth.jwt() ->> 'email') 
     AND u.tipo_usuario = 'administrador' 
     AND u.ativo = true
   ))
);

-- Política para INSERT: apenas administradores
CREATE POLICY "admin_insert_users" 
ON public.usuarios_sistema 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (auth.jwt() ->> 'email') IN (
    SELECT u.email FROM public.usuarios_sistema u 
    WHERE u.tipo_usuario = 'administrador' 
    AND u.ativo = true
  )
);

-- Política para UPDATE
CREATE POLICY "user_update_own_data" 
ON public.usuarios_sistema 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND (
    email = (auth.jwt() ->> 'email') OR
    (auth.jwt() ->> 'email') IN (
      SELECT u.email FROM public.usuarios_sistema u 
      WHERE u.tipo_usuario = 'administrador' 
      AND u.ativo = true
    )
  )
);

-- Política para DELETE: apenas administradores
CREATE POLICY "admin_delete_users" 
ON public.usuarios_sistema 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  (auth.jwt() ->> 'email') IN (
    SELECT u.email FROM public.usuarios_sistema u 
    WHERE u.tipo_usuario = 'administrador' 
    AND u.ativo = true
  )
);
