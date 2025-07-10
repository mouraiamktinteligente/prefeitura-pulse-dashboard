-- Adicionar coluna status_conexao na tabela logs_acesso para rastrear tipos de logout
ALTER TABLE public.logs_acesso 
ADD COLUMN status_conexao TEXT DEFAULT 'login' 
CHECK (status_conexao IN ('login', 'logout', 'desconectado_admin', 'timeout', 'erro_sessao'));

-- Atualizar registros existentes que não têm logout como 'logout'
UPDATE public.logs_acesso 
SET status_conexao = 'logout' 
WHERE data_hora_logout IS NOT NULL;

-- Criar índice para melhorar performance nas consultas de status
CREATE INDEX idx_logs_acesso_status ON public.logs_acesso(status_conexao);
CREATE INDEX idx_logs_acesso_email_status ON public.logs_acesso(email_usuario, status_conexao);

-- Comentários explicativos
COMMENT ON COLUMN public.logs_acesso.status_conexao IS 'Tipo de evento de conexão: login, logout, desconectado_admin, timeout, erro_sessao';