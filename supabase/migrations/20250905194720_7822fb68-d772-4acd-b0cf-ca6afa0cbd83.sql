-- Add new columns to marketing_imagens table for description handling
ALTER TABLE public.marketing_imagens 
ADD COLUMN descricao_gerada TEXT,
ADD COLUMN status_aprovacao_descricao TEXT NOT NULL DEFAULT 'pendente';