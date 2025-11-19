-- Converter campo permissoes de text para jsonb
-- Primeiro, atualizar valores existentes para garantir compatibilidade
UPDATE usuarios_sistema 
SET permissoes = CASE 
  WHEN permissoes IS NULL THEN NULL
  WHEN permissoes = '' THEN NULL
  WHEN permissoes::text ~ '^[\{\[]' THEN permissoes::jsonb::text -- já é JSON válido
  ELSE jsonb_build_object('raw', permissoes)::text -- converter string para jsonb object
END;

-- Alterar tipo da coluna de text para jsonb
ALTER TABLE usuarios_sistema 
ALTER COLUMN permissoes TYPE jsonb USING 
  CASE 
    WHEN permissoes IS NULL OR permissoes = '' THEN NULL
    ELSE permissoes::jsonb
  END;