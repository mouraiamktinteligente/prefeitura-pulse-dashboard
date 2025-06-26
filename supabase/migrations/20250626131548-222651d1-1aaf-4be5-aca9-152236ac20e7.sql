
-- Remover as políticas RLS restritivas da tabela cadastro_clientes
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar clientes" ON public.cadastro_clientes;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir clientes" ON public.cadastro_clientes;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar clientes" ON public.cadastro_clientes;
DROP POLICY IF EXISTS "Usuários autenticados podem excluir clientes" ON public.cadastro_clientes;

-- Desabilitar RLS na tabela cadastro_clientes (já que não precisamos de segurança por usuário)
ALTER TABLE public.cadastro_clientes DISABLE ROW LEVEL SECURITY;

-- OU se quisermos manter RLS ativo mas permitir acesso total para usuários autenticados:
-- Recriar políticas mais permissivas
-- ALTER TABLE public.cadastro_clientes ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Permitir tudo para usuários autenticados - SELECT" 
--   ON public.cadastro_clientes 
--   FOR SELECT 
--   TO authenticated
--   USING (true);

-- CREATE POLICY "Permitir tudo para usuários autenticados - INSERT" 
--   ON public.cadastro_clientes 
--   FOR INSERT 
--   TO authenticated
--   WITH CHECK (true);

-- CREATE POLICY "Permitir tudo para usuários autenticados - UPDATE" 
--   ON public.cadastro_clientes 
--   FOR UPDATE 
--   TO authenticated
--   USING (true);

-- CREATE POLICY "Permitir tudo para usuários autenticados - DELETE" 
--   ON public.cadastro_clientes 
--   FOR DELETE 
--   TO authenticated
--   USING (true);
