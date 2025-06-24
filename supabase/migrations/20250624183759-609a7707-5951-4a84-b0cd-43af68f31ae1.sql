
-- Remover todas as políticas existentes da tabela usuarios_sistema
DROP POLICY IF EXISTS "allow_user_access" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "admin_insert_users" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "user_update_own_data" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "admin_delete_users" ON public.usuarios_sistema;

-- Criar função auxiliar para verificar se o usuário é admin (sem recursão)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios_sistema 
    WHERE email = (auth.jwt() ->> 'email') 
    AND tipo_usuario = 'administrador' 
    AND ativo = true
  );
$$;

-- Política simples para SELECT: usuário pode ver seus próprios dados OU admin pode ver tudo
CREATE POLICY "usuarios_select_policy" 
ON public.usuarios_sistema 
FOR SELECT 
USING (
  -- Usuário autenticado pode ver seus próprios dados
  (auth.uid() IS NOT NULL AND email = (auth.jwt() ->> 'email')) OR
  -- OU é um admin (usando função auxiliar)
  (auth.uid() IS NOT NULL AND public.is_admin())
);

-- Política para INSERT: apenas admins podem inserir
CREATE POLICY "usuarios_insert_policy" 
ON public.usuarios_sistema 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND public.is_admin()
);

-- Política para UPDATE: usuário pode atualizar próprios dados OU admin pode atualizar qualquer um
CREATE POLICY "usuarios_update_policy" 
ON public.usuarios_sistema 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND (
    email = (auth.jwt() ->> 'email') OR
    public.is_admin()
  )
);

-- Política para DELETE: apenas admins podem deletar
CREATE POLICY "usuarios_delete_policy" 
ON public.usuarios_sistema 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND public.is_admin()
);
