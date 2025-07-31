-- Adicionar coluna nome_completo_prefeito na tabela cadastro_clientes
ALTER TABLE public.cadastro_clientes 
ADD COLUMN nome_completo_prefeito TEXT;