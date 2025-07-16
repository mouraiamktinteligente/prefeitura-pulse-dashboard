-- Corrigir relatórios duplicados 
-- 1. Remover duplicação específica (manter o mais recente)
DELETE FROM public.relatorio_analise_instagram 
WHERE id = 48 AND profile = 'prefeiturademorrinhos';

-- 2. Verificar e remover outras duplicações em todas as tabelas de relatórios
-- Instagram
DELETE FROM public.relatorio_analise_instagram r1
WHERE EXISTS (
    SELECT 1 FROM public.relatorio_analise_instagram r2 
    WHERE r2.profile = r1.profile 
    AND r2.nome_documento = r1.nome_documento
    AND DATE(r2.created_at) = DATE(r1.created_at)
    AND r2.id > r1.id
);

-- Prefeito  
DELETE FROM public.relatorio_analise_prefeito r1
WHERE EXISTS (
    SELECT 1 FROM public.relatorio_analise_prefeito r2 
    WHERE r2.profile = r1.profile 
    AND r2.nome_documento = r1.nome_documento
    AND DATE(r2.created_at) = DATE(r1.created_at)
    AND r2.id > r1.id
);

-- Web
DELETE FROM public.relatorio_analise_web r1
WHERE EXISTS (
    SELECT 1 FROM public.relatorio_analise_web r2 
    WHERE r2.profile = r1.profile 
    AND r2.nome_documento = r1.nome_documento
    AND DATE(r2.created_at) = DATE(r1.created_at)
    AND r2.id > r1.id
);

-- Qualitativo
DELETE FROM public.relatorio_qualitativo r1
WHERE EXISTS (
    SELECT 1 FROM public.relatorio_qualitativo r2 
    WHERE r2.profile = r1.profile 
    AND r2.nome_documento = r1.nome_documento
    AND DATE(r2.created_at) = DATE(r1.created_at)
    AND r2.id > r1.id
);

-- 3. Adicionar constraints únicas para prevenir futuras duplicações
-- Instagram
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_relatorio_instagram 
ON public.relatorio_analise_instagram (profile, nome_documento, DATE(created_at))
WHERE profile IS NOT NULL AND nome_documento IS NOT NULL;

-- Prefeito
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_relatorio_prefeito 
ON public.relatorio_analise_prefeito (profile, nome_documento, DATE(created_at))
WHERE profile IS NOT NULL AND nome_documento IS NOT NULL;

-- Web
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_relatorio_web 
ON public.relatorio_analise_web (profile, nome_documento, DATE(created_at))
WHERE profile IS NOT NULL AND nome_documento IS NOT NULL;

-- Qualitativo
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_relatorio_qualitativo 
ON public.relatorio_qualitativo (profile, nome_documento, DATE(created_at))
WHERE profile IS NOT NULL AND nome_documento IS NOT NULL;