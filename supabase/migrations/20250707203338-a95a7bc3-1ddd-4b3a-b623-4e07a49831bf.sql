-- Habilitar realtime na tabela resumo_sentimento_por_profile
ALTER TABLE public.resumo_sentimento_por_profile REPLICA IDENTITY FULL;

-- Adicionar a tabela ao publication realtime do Supabase
ALTER publication supabase_realtime ADD TABLE public.resumo_sentimento_por_profile;