-- Criar tabela para gerenciar sessões ativas
CREATE TABLE public.sessoes_ativas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  session_token UUID NOT NULL DEFAULT gen_random_uuid(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '20 minutes'),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_sessoes_ativas_user_email ON public.sessoes_ativas(user_email);
CREATE INDEX idx_sessoes_ativas_session_token ON public.sessoes_ativas(session_token);
CREATE INDEX idx_sessoes_ativas_ativo ON public.sessoes_ativas(ativo);
CREATE UNIQUE INDEX idx_sessoes_ativas_user_token ON public.sessoes_ativas(user_email, session_token) WHERE ativo = true;

-- Habilitar RLS
ALTER TABLE public.sessoes_ativas ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias sessões
CREATE POLICY "Usuários podem ver suas próprias sessões" 
ON public.sessoes_ativas 
FOR SELECT 
USING (user_email = (SELECT email FROM usuarios_sistema WHERE email = auth.jwt() ->> 'email' AND ativo = true));

-- Política para usuários gerenciarem suas próprias sessões
CREATE POLICY "Usuários podem gerenciar suas próprias sessões" 
ON public.sessoes_ativas 
FOR ALL
USING (user_email = (SELECT email FROM usuarios_sistema WHERE email = auth.jwt() ->> 'email' AND ativo = true))
WITH CHECK (user_email = (SELECT email FROM usuarios_sistema WHERE email = auth.jwt() ->> 'email' AND ativo = true));

-- Política para administradores verem todas as sessões
CREATE POLICY "Administradores podem ver todas as sessões" 
ON public.sessoes_ativas 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM usuarios_sistema 
  WHERE email = auth.jwt() ->> 'email' 
  AND tipo_usuario = 'administrador' 
  AND ativo = true
));

-- Política para administradores gerenciarem todas as sessões
CREATE POLICY "Administradores podem gerenciar todas as sessões" 
ON public.sessoes_ativas 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM usuarios_sistema 
  WHERE email = auth.jwt() ->> 'email' 
  AND tipo_usuario = 'administrador' 
  AND ativo = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM usuarios_sistema 
  WHERE email = auth.jwt() ->> 'email' 
  AND tipo_usuario = 'administrador' 
  AND ativo = true
));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_sessoes_ativas_updated_at
BEFORE UPDATE ON public.sessoes_ativas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION public.limpar_sessoes_expiradas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.sessoes_ativas 
  SET ativo = false, updated_at = now()
  WHERE expires_at < now() AND ativo = true;
END;
$$;