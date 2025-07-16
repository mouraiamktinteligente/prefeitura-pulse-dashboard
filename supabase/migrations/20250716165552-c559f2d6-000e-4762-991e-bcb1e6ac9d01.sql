-- Limpar todas as sessões ativas existentes para reiniciar o sistema com segurança
UPDATE public.sessoes_ativas 
SET ativo = false, updated_at = now()
WHERE ativo = true;

-- Marcar todos os usuários como desconectados para que reconectem com nova validação
UPDATE public.usuarios_sistema 
SET status_conexao = 'desconectado'
WHERE status_conexao = 'conectado';