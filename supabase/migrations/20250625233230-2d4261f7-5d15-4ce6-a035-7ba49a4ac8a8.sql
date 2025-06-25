
-- Remover o trigger que estava gerando URL pública automaticamente
DROP TRIGGER IF EXISTS trigger_generate_url_original ON public.documentos_analisados;

-- Remover a função que gerava URL pública
DROP FUNCTION IF EXISTS public.generate_url_original();
