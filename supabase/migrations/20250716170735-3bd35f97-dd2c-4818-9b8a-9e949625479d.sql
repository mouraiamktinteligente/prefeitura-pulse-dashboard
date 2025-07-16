-- Criar função para garantir sessão única por usuário
CREATE OR REPLACE FUNCTION public.enforce_single_session_per_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando inserindo nova sessão ativa, desativar outras do mesmo usuário
  IF NEW.ativo = true THEN
    UPDATE public.sessoes_ativas 
    SET ativo = false, updated_at = now()
    WHERE user_email = NEW.user_email 
      AND id != NEW.id 
      AND ativo = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger que será executado antes de inserir nova sessão
DROP TRIGGER IF EXISTS trigger_enforce_single_session ON public.sessoes_ativas;
CREATE TRIGGER trigger_enforce_single_session
  BEFORE INSERT ON public.sessoes_ativas
  FOR EACH ROW 
  EXECUTE FUNCTION public.enforce_single_session_per_user();

-- Criar constraint única para garantir apenas uma sessão ativa por usuário
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_session 
ON public.sessoes_ativas (user_email) 
WHERE ativo = true;