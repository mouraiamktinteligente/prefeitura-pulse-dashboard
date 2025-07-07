-- Habilitar realtime na tabela analysis-comments que alimenta a view resumo_sentimento_por_profile
ALTER TABLE public."analysis-comments" REPLICA IDENTITY FULL;

-- Adicionar a tabela ao publication realtime do Supabase
ALTER publication supabase_realtime ADD TABLE public."analysis-comments";