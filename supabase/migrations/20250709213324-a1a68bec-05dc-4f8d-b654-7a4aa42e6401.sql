-- Adicionar coluna status_conexao na tabela usuarios_sistema
ALTER TABLE public.usuarios_sistema 
ADD COLUMN status_conexao TEXT NOT NULL DEFAULT 'desconectado' 
CHECK (status_conexao IN ('conectado', 'desconectado'));

-- Criar índice para melhorar performance nas consultas de status
CREATE INDEX idx_usuarios_sistema_status_conexao ON public.usuarios_sistema(status_conexao);

-- Criar função para atualizar automaticamente o status quando sessão é invalidada
CREATE OR REPLACE FUNCTION public.sync_user_status_on_session_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Quando uma sessão é desativada, marcar usuário como desconectado
  IF NEW.ativo = false AND OLD.ativo = true THEN
    UPDATE public.usuarios_sistema 
    SET status_conexao = 'desconectado'
    WHERE email = NEW.user_email;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para sincronizar status quando sessão for invalidada
CREATE TRIGGER trigger_sync_user_status_on_session_change
  AFTER UPDATE ON public.sessoes_ativas
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_status_on_session_change();

-- Atualizar usuários ativos existentes que têm sessões válidas
UPDATE public.usuarios_sistema 
SET status_conexao = 'conectado'
WHERE email IN (
  SELECT DISTINCT user_email 
  FROM public.sessoes_ativas 
  WHERE ativo = true 
  AND expires_at > NOW()
);

-- Comentários explicativos
COMMENT ON COLUMN public.usuarios_sistema.status_conexao IS 'Status de conexão do usuário: conectado ou desconectado';
COMMENT ON FUNCTION public.sync_user_status_on_session_change() IS 'Sincroniza automaticamente o status do usuário quando a sessão é invalidada';