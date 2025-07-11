-- Habilitar realtime para a tabela logs_acesso
ALTER TABLE public.logs_acesso REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação do realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.logs_acesso;