-- Corrigir relatórios duplicados - abordagem simplificada
-- 1. Remover duplicação específica (manter o mais recente)
DELETE FROM public.relatorio_analise_instagram 
WHERE id = 48 AND profile = 'prefeiturademorrinhos';

-- 2. Remover outras duplicações existentes mantendo apenas o mais recente de cada tipo
-- Instagram
WITH duplicados AS (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY profile, nome_documento, created_at::date ORDER BY id DESC) as rn
    FROM public.relatorio_analise_instagram
    WHERE profile IS NOT NULL AND nome_documento IS NOT NULL
)
DELETE FROM public.relatorio_analise_instagram 
WHERE id IN (
    SELECT id FROM duplicados WHERE rn > 1
);

-- Prefeito  
WITH duplicados AS (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY profile, nome_documento, created_at::date ORDER BY id DESC) as rn
    FROM public.relatorio_analise_prefeito
    WHERE profile IS NOT NULL AND nome_documento IS NOT NULL
)
DELETE FROM public.relatorio_analise_prefeito 
WHERE id IN (
    SELECT id FROM duplicados WHERE rn > 1
);

-- Web
WITH duplicados AS (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY profile, nome_documento, created_at::date ORDER BY id DESC) as rn
    FROM public.relatorio_analise_web
    WHERE profile IS NOT NULL AND nome_documento IS NOT NULL
)
DELETE FROM public.relatorio_analise_web 
WHERE id IN (
    SELECT id FROM duplicados WHERE rn > 1
);

-- Qualitativo
WITH duplicados AS (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY profile, nome_documento, created_at::date ORDER BY id DESC) as rn
    FROM public.relatorio_qualitativo
    WHERE profile IS NOT NULL AND nome_documento IS NOT NULL
)
DELETE FROM public.relatorio_qualitativo 
WHERE id IN (
    SELECT id FROM duplicados WHERE rn > 1
);