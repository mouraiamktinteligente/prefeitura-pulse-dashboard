
-- Criar tabela para logs de acesso
CREATE TABLE public.logs_acesso (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_usuario TEXT NOT NULL,
  data_hora_login TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_hora_logout TIMESTAMP WITH TIME ZONE NULL,
  ip_address TEXT NULL,
  user_agent TEXT NULL,
  session_id TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.logs_acesso ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados vejam apenas seus próprios logs
CREATE POLICY "Users can view their own access logs" 
  ON public.logs_acesso 
  FOR SELECT 
  USING (auth.jwt() ->> 'email' = email_usuario);

-- Política para permitir inserir logs de acesso
CREATE POLICY "Users can create access logs" 
  ON public.logs_acesso 
  FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'email' = email_usuario);

-- Política para permitir atualizar logs de acesso (logout)
CREATE POLICY "Users can update their own access logs" 
  ON public.logs_acesso 
  FOR UPDATE 
  USING (auth.jwt() ->> 'email' = email_usuario);

-- Política especial para administradores verem todos os logs
CREATE POLICY "Admins can view all access logs" 
  ON public.logs_acesso 
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Criar índices para performance
CREATE INDEX idx_logs_acesso_email ON public.logs_acesso(email_usuario);
CREATE INDEX idx_logs_acesso_login_time ON public.logs_acesso(data_hora_login);
CREATE INDEX idx_logs_acesso_logout_time ON public.logs_acesso(data_hora_logout);
