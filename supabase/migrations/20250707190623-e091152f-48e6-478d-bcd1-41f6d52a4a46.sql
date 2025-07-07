-- Add drive_folder_id column to documentos_analisados table
ALTER TABLE public.documentos_analisados 
ADD COLUMN drive_folder_id TEXT NULL;

-- Add comment to document the purpose of this column
COMMENT ON COLUMN public.documentos_analisados.drive_folder_id IS 'ID da pasta criada no Google Drive onde o documento foi salvo';