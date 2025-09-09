-- Enable Row Level Security on usuarios_sistema table
ALTER TABLE public.usuarios_sistema ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own profile data
CREATE POLICY "Usuários podem visualizar seus próprios dados" 
ON public.usuarios_sistema 
FOR SELECT 
USING (
  email = (auth.jwt() ->> 'email')
);

-- Policy for administrators to view all user data
CREATE POLICY "Administradores podem visualizar todos os usuários" 
ON public.usuarios_sistema 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.usuarios_sistema admin_user
    WHERE admin_user.email = (auth.jwt() ->> 'email')
    AND admin_user.tipo_usuario = 'administrador'
    AND admin_user.ativo = true
  )
);

-- Policy for user registration (system can create new users)
CREATE POLICY "Sistema pode criar novos usuários" 
ON public.usuarios_sistema 
FOR INSERT 
WITH CHECK (true);

-- Policy for users to update their own data (excluding sensitive fields)
CREATE POLICY "Usuários podem atualizar seus próprios dados" 
ON public.usuarios_sistema 
FOR UPDATE 
USING (
  email = (auth.jwt() ->> 'email')
);

-- Policy for administrators to update any user data
CREATE POLICY "Administradores podem atualizar qualquer usuário" 
ON public.usuarios_sistema 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.usuarios_sistema admin_user
    WHERE admin_user.email = (auth.jwt() ->> 'email')
    AND admin_user.tipo_usuario = 'administrador'
    AND admin_user.ativo = true
  )
);

-- Policy for administrators to delete users
CREATE POLICY "Administradores podem deletar usuários" 
ON public.usuarios_sistema 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.usuarios_sistema admin_user
    WHERE admin_user.email = (auth.jwt() ->> 'email')
    AND admin_user.tipo_usuario = 'administrador'
    AND admin_user.ativo = true
  )
);

-- Create a security definer function for authentication that bypasses RLS
CREATE OR REPLACE FUNCTION public.authenticate_user(p_email text, p_senha_hash text)
RETURNS TABLE(
  id uuid,
  email text,
  nome_completo text,
  tipo_usuario public.tipo_usuario,
  ativo boolean,
  permissoes text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.nome_completo,
    u.tipo_usuario,
    u.ativo,
    u.permissoes
  FROM public.usuarios_sistema u
  WHERE u.email = p_email 
  AND u.senha_hash = p_senha_hash
  AND u.ativo = true;
END;
$$;