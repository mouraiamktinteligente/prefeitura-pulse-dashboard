-- Normalizar profiles na tabela instagram_posts removendo o "@" inicial
UPDATE instagram_posts 
SET profile = TRIM(LEADING '@' FROM profile)
WHERE profile LIKE '@%';

-- Normalizar profiles na tabela cadastro_clientes removendo o "@" inicial  
UPDATE cadastro_clientes 
SET instagram_prefeitura = TRIM(LEADING '@' FROM instagram_prefeitura)
WHERE instagram_prefeitura LIKE '@%';

UPDATE cadastro_clientes 
SET instagram_prefeito = TRIM(LEADING '@' FROM instagram_prefeito)
WHERE instagram_prefeito LIKE '@%';