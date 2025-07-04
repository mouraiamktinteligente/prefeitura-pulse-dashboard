
-- Adicionar coluna para armazenar URL do Google Drive na tabela documentos_analisados
ALTER TABLE public.documentos_analisados 
ADD COLUMN google_drive_url text;

-- Adicionar índice para performance nas consultas pela URL do Drive
CREATE INDEX idx_documentos_analisados_google_drive_url 
ON public.documentos_analisados(google_drive_url);
