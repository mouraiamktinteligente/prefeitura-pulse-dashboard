-- Adicionar colunas para responsável de alerta de crise na tabela usuarios_sistema
ALTER TABLE public.usuarios_sistema 
ADD COLUMN responsavel_alerta_crise TEXT NULL;

ALTER TABLE public.usuarios_sistema 
ADD COLUMN whatsapp_responsavel_crise TEXT NULL;

-- Adicionar comentários explicativos
COMMENT ON COLUMN public.usuarios_sistema.responsavel_alerta_crise IS 
'Nome do responsável designado para receber e tratar alertas de crise';

COMMENT ON COLUMN public.usuarios_sistema.whatsapp_responsavel_crise IS 
'Número de WhatsApp do responsável por alertas de crise para contato direto';

-- Criar índice para facilitar buscas por responsáveis
CREATE INDEX idx_usuarios_responsavel_crise ON public.usuarios_sistema(responsavel_alerta_crise) 
WHERE responsavel_alerta_crise IS NOT NULL;