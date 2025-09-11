-- Normalizar profiles apenas em tabelas reais (não views) removendo o "@" inicial

-- Tabela analysis-comments
UPDATE "analysis-comments" 
SET profile = TRIM(LEADING '@' FROM profile)
WHERE profile LIKE '@%';

-- Tabela analisados
UPDATE analisados 
SET profile = TRIM(LEADING '@' FROM profile)
WHERE profile LIKE '@%';

-- Tabela post-profile
UPDATE "post-profile" 
SET profile = TRIM(LEADING '@' FROM profile)
WHERE profile LIKE '@%';

-- Tabela perfil-negative
UPDATE "perfil-negative" 
SET profile = TRIM(LEADING '@' FROM profile)
WHERE profile LIKE '@%';

-- Tabela pesquisa_status
UPDATE pesquisa_status 
SET profile = TRIM(LEADING '@' FROM profile)
WHERE profile LIKE '@%';

-- Tabela pesquisas_prefeitura
UPDATE pesquisas_prefeitura 
SET profile = TRIM(LEADING '@' FROM profile)
WHERE profile LIKE '@%';

-- Tabela monitoria_relatorios
UPDATE monitoria_relatorios 
SET profile = TRIM(LEADING '@' FROM profile)
WHERE profile LIKE '@%';

-- Tabela relatorio_analise_instagram
UPDATE relatorio_analise_instagram 
SET profile = TRIM(LEADING '@' FROM profile)
WHERE profile LIKE '@%';

-- Tabela relatorio_analise_prefeito
UPDATE relatorio_analise_prefeito 
SET profile = TRIM(LEADING '@' FROM profile)
WHERE profile LIKE '@%';

-- Tabela relatorio_analise_web
UPDATE relatorio_analise_web 
SET profile = TRIM(LEADING '@' FROM profile)
WHERE profile LIKE '@%';

-- Tabela relatorio_qualitativo
UPDATE relatorio_qualitativo 
SET profile = TRIM(LEADING '@' FROM profile)
WHERE profile LIKE '@%';

-- Tabela promessas_prefeito
UPDATE promessas_prefeito 
SET profile = TRIM(LEADING '@' FROM profile)
WHERE profile LIKE '@%';

-- Tabela profiles_monitorados
UPDATE profiles_monitorados 
SET profile_prefeitura = TRIM(LEADING '@' FROM profile_prefeitura)
WHERE profile_prefeitura LIKE '@%';

UPDATE profiles_monitorados 
SET profile_prefeito = TRIM(LEADING '@' FROM profile_prefeito)
WHERE profile_prefeito LIKE '@%';

-- Tabela alerta_crise
UPDATE alerta_crise 
SET profile_prefeito = TRIM(LEADING '@' FROM profile_prefeito)
WHERE profile_prefeito LIKE '@%';

UPDATE alerta_crise 
SET profile_prefeitura = TRIM(LEADING '@' FROM profile_prefeitura)
WHERE profile_prefeitura LIKE '@%';

-- Tabela calendario_de_eventos
UPDATE calendario_de_eventos 
SET profile = TRIM(LEADING '@' FROM profile)
WHERE profile LIKE '@%';

-- Tabela alertas_comentarios
UPDATE alertas_comentarios 
SET profile = TRIM(LEADING '@' FROM profile)
WHERE profile LIKE '@%';