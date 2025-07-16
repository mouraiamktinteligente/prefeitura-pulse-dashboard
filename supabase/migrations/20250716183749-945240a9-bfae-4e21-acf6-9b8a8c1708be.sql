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
    AND r2.created_at::date = r1.created_at::date
    AND r2.id > r1.id
);

-- Prefeito  
DELETE FROM public.relatorio_analise_prefeito r1
WHERE EXISTS (
    SELECT 1 FROM public.relatorio_analise_prefeito r2 
    WHERE r2.profile = r1.profile 
    AND r2.nome_documento = r1.nome_documento
    AND r2.created_at::date = r1.created_at::date
    AND r2.id > r1.id
);

-- Web
DELETE FROM public.relatorio_analise_web r1
WHERE EXISTS (
    SELECT 1 FROM public.relatorio_analise_web r2 
    WHERE r2.profile = r1.profile 
    AND r2.nome_documento = r1.nome_documento
    AND r2.created_at::date = r1.created_at::date
    AND r2.id > r1.id
);

-- Qualitativo
DELETE FROM public.relatorio_qualitativo r1
WHERE EXISTS (
    SELECT 1 FROM public.relatorio_qualitativo r2 
    WHERE r2.profile = r1.profile 
    AND r2.nome_documento = r1.nome_documento
    AND r2.created_at::date = r1.created_at::date
    AND r2.id > r1.id
);

-- 3. Adicionar colunas computadas para data (sem funções nos índices)
ALTER TABLE public.relatorio_analise_instagram 
ADD COLUMN IF NOT EXISTS data_criacao DATE GENERATED ALWAYS AS (created_at::date) STORED;

ALTER TABLE public.relatorio_analise_prefeito 
ADD COLUMN IF NOT EXISTS data_criacao DATE GENERATED ALWAYS AS (created_at::date) STORED;

ALTER TABLE public.relatorio_analise_web 
ADD COLUMN IF NOT EXISTS data_criacao DATE GENERATED ALWAYS AS (created_at::date) STORED;

ALTER TABLE public.relatorio_qualitativo 
ADD COLUMN IF NOT EXISTS data_criacao DATE GENERATED ALWAYS AS (created_at::date) STORED;

-- 4. Criar índices únicos usando as colunas computadas
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_relatorio_instagram 
ON public.relatorio_analise_instagram (profile, nome_documento, data_criacao)
WHERE profile IS NOT NULL AND nome_documento IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_relatorio_prefeito 
ON public.relatorio_analise_prefeito (profile, nome_documento, data_criacao)
WHERE profile IS NOT NULL AND nome_documento IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_relatorio_web 
ON public.relatorio_analise_web (profile, nome_documento, data_criacao)
WHERE profile IS NOT NULL AND nome_documento IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_relatorio_qualitativo 
ON public.relatorio_qualitativo (profile, nome_documento, data_criacao)
WHERE profile IS NOT NULL AND nome_documento IS NOT NULL;