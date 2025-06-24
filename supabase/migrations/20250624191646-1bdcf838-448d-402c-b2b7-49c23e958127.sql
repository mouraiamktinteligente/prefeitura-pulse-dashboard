
-- Habilitar RLS na tabela logs_acesso mas permitir inserção livre
ALTER TABLE public.logs_acesso ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que podem estar bloqueando
DROP POLICY IF EXISTS "Users can view their own access logs" ON public.logs_acesso;
DROP POLICY IF EXISTS "Users can create access logs" ON public.logs_acesso;
DROP POLICY IF EXISTS "Users can update their own access logs" ON public.logs_acesso;
DROP POLICY IF EXISTS "Admins can view all access logs" ON public.logs_acesso;

-- Criar política simples que permite inserção e visualização livre
CREATE POLICY "Allow all access to logs_acesso" 
  ON public.logs_acesso 
  FOR ALL 
  USING (true)
  WITH CHECK (true);
