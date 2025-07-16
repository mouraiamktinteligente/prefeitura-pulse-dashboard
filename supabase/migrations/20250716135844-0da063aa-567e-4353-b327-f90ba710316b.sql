-- Habilitar realtime para todas as tabelas restantes

-- Tabela usuarios_sistema
ALTER TABLE public.usuarios_sistema REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.usuarios_sistema;

-- Tabelas de relatórios
ALTER TABLE public.relatorio_analise_instagram REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.relatorio_analise_instagram;

ALTER TABLE public.relatorio_analise_prefeito REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.relatorio_analise_prefeito;

ALTER TABLE public.relatorio_analise_web REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.relatorio_analise_web;

ALTER TABLE public.relatorio_qualitativo REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.relatorio_qualitativo;

-- Tabela sessoes_ativas
ALTER TABLE public.sessoes_ativas REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessoes_ativas;

-- Tabela profiles_monitorados
ALTER TABLE public.profiles_monitorados REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles_monitorados;

-- Tabela promessas_prefeito
ALTER TABLE public.promessas_prefeito REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.promessas_prefeito;

-- Tabela pesquisa_status
ALTER TABLE public.pesquisa_status REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pesquisa_status;

-- Tabela pesquisas_prefeitura
ALTER TABLE public.pesquisas_prefeitura REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pesquisas_prefeitura;

-- Tabelas de análise de comentários (se ainda não habilitadas)
ALTER TABLE public."analysis-comments" REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public."analysis-comments";

ALTER TABLE public."perfil-negative" REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public."perfil-negative";

ALTER TABLE public."post-profile" REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public."post-profile";