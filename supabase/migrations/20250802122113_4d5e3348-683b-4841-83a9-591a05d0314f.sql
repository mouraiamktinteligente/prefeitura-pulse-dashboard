-- Adicionar nova coluna url_plano
ALTER TABLE public.documentos_analisados 
ADD COLUMN url_plano TEXT;

-- Migrar dados existentes da url_analise para url_plano
UPDATE public.documentos_analisados 
SET url_plano = url_analise 
WHERE url_analise IS NOT NULL;

-- Limpar a coluna url_analise para receber novos dados do N8N
UPDATE public.documentos_analisados 
SET url_analise = NULL;