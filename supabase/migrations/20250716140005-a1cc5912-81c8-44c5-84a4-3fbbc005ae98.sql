-- Habilitar realtime apenas para tabelas que ainda não têm

-- Tabela usuarios_sistema
ALTER TABLE public.usuarios_sistema REPLICA IDENTITY FULL;

-- Verificar e adicionar apenas tabelas não incluídas na publicação
DO $$
BEGIN
    -- usuarios_sistema
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'usuarios_sistema'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.usuarios_sistema;
    END IF;

    -- relatorio_analise_instagram
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'relatorio_analise_instagram'
    ) THEN
        ALTER TABLE public.relatorio_analise_instagram REPLICA IDENTITY FULL;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.relatorio_analise_instagram;
    END IF;

    -- relatorio_analise_prefeito
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'relatorio_analise_prefeito'
    ) THEN
        ALTER TABLE public.relatorio_analise_prefeito REPLICA IDENTITY FULL;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.relatorio_analise_prefeito;
    END IF;

    -- relatorio_analise_web
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'relatorio_analise_web'
    ) THEN
        ALTER TABLE public.relatorio_analise_web REPLICA IDENTITY FULL;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.relatorio_analise_web;
    END IF;

    -- relatorio_qualitativo
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'relatorio_qualitativo'
    ) THEN
        ALTER TABLE public.relatorio_qualitativo REPLICA IDENTITY FULL;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.relatorio_qualitativo;
    END IF;

    -- sessoes_ativas
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'sessoes_ativas'
    ) THEN
        ALTER TABLE public.sessoes_ativas REPLICA IDENTITY FULL;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.sessoes_ativas;
    END IF;

    -- profiles_monitorados
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'profiles_monitorados'
    ) THEN
        ALTER TABLE public.profiles_monitorados REPLICA IDENTITY FULL;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles_monitorados;
    END IF;

    -- promessas_prefeito
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'promessas_prefeito'
    ) THEN
        ALTER TABLE public.promessas_prefeito REPLICA IDENTITY FULL;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.promessas_prefeito;
    END IF;

    -- pesquisas_prefeitura
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'pesquisas_prefeitura'
    ) THEN
        ALTER TABLE public.pesquisas_prefeitura REPLICA IDENTITY FULL;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pesquisas_prefeitura;
    END IF;

END $$;