-- Habilitar realtime na tabela documentos_analisados
ALTER TABLE public.documentos_analisados REPLICA IDENTITY FULL;

-- Adicionar a tabela ao publication realtime do Supabase
ALTER publication supabase_realtime ADD TABLE public.documentos_analisados;