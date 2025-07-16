-- 1. Corrigir expiração de sessões para 4 horas ao invés de 1 ano
ALTER TABLE public.sessoes_ativas 
ALTER COLUMN expires_at SET DEFAULT (now() + '4 hours'::interval);

-- 2. Adicionar coluna IP address para controle único por usuário
ALTER TABLE public.sessoes_ativas 
ADD COLUMN ip_address TEXT;

-- 3. Criar índice único para garantir uma sessão ativa por usuário
CREATE UNIQUE INDEX idx_unique_active_session_per_user 
ON public.sessoes_ativas (user_email) 
WHERE ativo = true;

-- 4. Criar índice para verificação de IP único (opcional para alertas)
CREATE INDEX idx_sessoes_ativas_ip 
ON public.sessoes_ativas (ip_address) 
WHERE ativo = true;

-- 5. Função para limpar sessões expiradas automaticamente
CREATE OR REPLACE FUNCTION public.limpar_sessoes_expiradas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Desativar sessões expiradas
  UPDATE public.sessoes_ativas 
  SET ativo = false, updated_at = now()
  WHERE expires_at < now() AND ativo = true;
  
  -- Marcar usuários com sessões expiradas como desconectados
  UPDATE public.usuarios_sistema 
  SET status_conexao = 'desconectado'
  WHERE email IN (
    SELECT DISTINCT user_email 
    FROM public.sessoes_ativas 
    WHERE expires_at < now() AND ativo = false 
    AND updated_at > now() - interval '1 minute'
  );
END;
$$;

-- 6. Função para renovar sessão automaticamente
CREATE OR REPLACE FUNCTION public.renovar_sessao(p_user_email TEXT, p_session_token UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.sessoes_ativas
  SET 
    last_activity = now(),
    expires_at = now() + '4 hours'::interval,
    updated_at = now()
  WHERE user_email = p_user_email 
    AND session_token = p_session_token 
    AND ativo = true
    AND expires_at > now();
    
  RETURN FOUND;
END;
$$;

-- 7. Função para verificar múltiplas sessões do mesmo IP (alerta de segurança)
CREATE OR REPLACE FUNCTION public.verificar_sessoes_multiplas_ip(p_ip_address TEXT)
RETURNS TABLE(user_email TEXT, count_sessions BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.user_email,
    COUNT(*)::BIGINT as count_sessions
  FROM public.sessoes_ativas s
  WHERE s.ip_address = p_ip_address 
    AND s.ativo = true
    AND s.expires_at > now()
  GROUP BY s.user_email
  HAVING COUNT(*) > 1;
END;
$$;

-- 8. Trigger para validação de sessão única por usuário
CREATE OR REPLACE FUNCTION public.enforce_single_session_per_user()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se inserindo nova sessão ativa, desativar outras do mesmo usuário
  IF NEW.ativo = true THEN
    UPDATE public.sessoes_ativas 
    SET ativo = false, updated_at = now()
    WHERE user_email = NEW.user_email 
      AND id != NEW.id 
      AND ativo = true;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_enforce_single_session
  AFTER INSERT OR UPDATE ON public.sessoes_ativas
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_single_session_per_user();