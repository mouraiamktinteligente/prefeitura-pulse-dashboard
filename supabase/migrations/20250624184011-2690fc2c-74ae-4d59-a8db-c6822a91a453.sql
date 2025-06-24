
-- Desabilitar RLS temporariamente para limpar tudo
ALTER TABLE public.usuarios_sistema DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes (incluindo as políticas com nomes antigos)
DROP POLICY IF EXISTS "allow_user_access" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "admin_insert_users" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "user_update_own_data" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "admin_delete_users" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "usuarios_select_policy" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "usuarios_insert_policy" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "usuarios_update_policy" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "usuarios_delete_policy" ON public.usuarios_sistema;

-- Remover função antiga se existir
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Recriar a função de forma mais simples
CREATE OR REPLACE FUNCTION public.check_admin_access()
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

-- Reabilitar RLS
ALTER TABLE public.usuarios_sistema ENABLE ROW LEVEL SECURITY;

-- Criar política ÚNICA e simples para SELECT
CREATE POLICY "allow_authenticated_select" ON public.usuarios_sistema
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    email = (auth.jwt() ->> 'email') OR
    public.check_admin_access()
  )
);

-- Política simples para INSERT (só admin)
CREATE POLICY "allow_admin_insert" ON public.usuarios_sistema
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND public.check_admin_access()
);

-- Política simples para UPDATE
CREATE POLICY "allow_update" ON public.usuarios_sistema
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    email = (auth.jwt() ->> 'email') OR
    public.check_admin_access()
  )
);

-- Política simples para DELETE (só admin)
CREATE POLICY "allow_admin_delete" ON public.usuarios_sistema
FOR DELETE USING (
  auth.uid() IS NOT NULL AND public.check_admin_access()
);
