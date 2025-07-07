
-- Habilitar realtime na tabela cadastro_clientes
ALTER TABLE public.cadastro_clientes REPLICA IDENTITY FULL;

-- Adicionar a tabela ao publication realtime do Supabase
ALTER publication supabase_realtime ADD TABLE public.cadastro_clientes;
