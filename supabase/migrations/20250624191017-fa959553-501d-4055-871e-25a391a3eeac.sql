
-- Primeiro, adicionar constraint única para email se não existir
ALTER TABLE public.usuarios_sistema 
ADD CONSTRAINT usuarios_sistema_email_unique UNIQUE (email);

-- Remover TODAS as políticas existentes da tabela usuarios_sistema
DROP POLICY IF EXISTS "allow_user_access" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "admin_insert_users" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "user_update_own_data" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "admin_delete_users" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "usuarios_select_policy" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "usuarios_insert_policy" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "usuarios_update_policy" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "usuarios_delete_policy" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "allow_authenticated_select" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "allow_admin_insert" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "allow_update" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "allow_admin_delete" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "allow_all_authenticated" ON public.usuarios_sistema;
DROP POLICY IF EXISTS "allow_all_access" ON public.usuarios_sistema;

-- Remover função que causa recursão
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.check_admin_access() CASCADE;

-- Desabilitar RLS completamente para permitir acesso livre
ALTER TABLE public.usuarios_sistema DISABLE ROW LEVEL SECURITY;

-- Limpar dados existentes primeiro
DELETE FROM public.usuarios_sistema WHERE email IN ('admin@sistema.com', 'marcoaurelioexp@gmail.com');

-- Inserir usuários de teste
INSERT INTO public.usuarios_sistema (
  tipo_usuario,
  tipo_pessoa,
  nome_completo,
  cpf_cnpj,
  email,
  permissoes,
  ativo
) VALUES 
(
  'administrador',
  'fisica',
  'Admin Sistema',
  '12345678901',
  'admin@sistema.com',
  '{"Full": true}',
  true
),
(
  'administrador',
  'fisica',
  'Marco Aurélio',
  '98765432100',
  'marcoaurelioexp@gmail.com',
  '{"Full": true}',
  true
);
