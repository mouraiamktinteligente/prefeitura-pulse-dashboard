-- Adicionar nova coluna instagram_prefeito
ALTER TABLE public.cadastro_clientes 
ADD COLUMN instagram_prefeito text;

-- Renomear coluna instagram para instagram_prefeitura
ALTER TABLE public.cadastro_clientes 
RENAME COLUMN instagram TO instagram_prefeitura;