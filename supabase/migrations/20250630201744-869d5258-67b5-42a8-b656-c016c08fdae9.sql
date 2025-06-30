
-- Adicionar coluna nome_cliente na tabela documentos_analisados
ALTER TABLE public.documentos_analisados 
ADD COLUMN nome_cliente text;

-- Atualizar registros existentes com o nome do cliente baseado no cliente_id
UPDATE public.documentos_analisados 
SET nome_cliente = (
  SELECT nome_completo 
  FROM public.cadastro_clientes 
  WHERE cadastro_clientes.id = documentos_analisados.cliente_id
);

-- Criar índice para melhorar performance de consultas por nome do cliente
CREATE INDEX idx_documentos_analisados_nome_cliente ON public.documentos_analisados(nome_cliente);
