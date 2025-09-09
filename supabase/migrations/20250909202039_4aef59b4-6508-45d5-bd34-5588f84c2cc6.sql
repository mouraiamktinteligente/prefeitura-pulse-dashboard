-- Enable Row Level Security on cadastro_clientes table
ALTER TABLE public.cadastro_clientes ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users with active sessions to read client data
CREATE POLICY "Usuários autenticados podem visualizar clientes" 
ON public.cadastro_clientes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.sessoes_ativas sa
    JOIN public.usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true 
    AND sa.expires_at > now() 
    AND us.ativo = true
    AND sa.user_email = (auth.jwt() ->> 'email')
  )
);

-- Create policy for authenticated users to create client records
CREATE POLICY "Usuários autenticados podem criar clientes" 
ON public.cadastro_clientes 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.sessoes_ativas sa
    JOIN public.usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true 
    AND sa.expires_at > now() 
    AND us.ativo = true
    AND sa.user_email = (auth.jwt() ->> 'email')
  )
);

-- Create policy for authenticated users to update client records
CREATE POLICY "Usuários autenticados podem atualizar clientes" 
ON public.cadastro_clientes 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.sessoes_ativas sa
    JOIN public.usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true 
    AND sa.expires_at > now() 
    AND us.ativo = true
    AND sa.user_email = (auth.jwt() ->> 'email')
  )
);

-- Create policy for authenticated users to delete client records
CREATE POLICY "Usuários autenticados podem deletar clientes" 
ON public.cadastro_clientes 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.sessoes_ativas sa
    JOIN public.usuarios_sistema us ON us.email = sa.user_email
    WHERE sa.ativo = true 
    AND sa.expires_at > now() 
    AND us.ativo = true
    AND sa.user_email = (auth.jwt() ->> 'email')
  )
);