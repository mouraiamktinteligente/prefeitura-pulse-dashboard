
-- Primeiro, vamos inserir um administrador padrão na tabela usuarios_sistema
-- Este será o primeiro usuário administrador que poderá criar outros usuários
INSERT INTO public.usuarios_sistema (
  tipo_usuario,
  tipo_pessoa,
  nome_completo,
  cpf_cnpj,
  email,
  senha_hash,
  ativo
) VALUES (
  'administrador',
  'fisica',
  'Administrador Principal',
  '12345678901', -- CPF fictício para o admin
  'admin@sistema.com', -- Email do administrador
  '$2a$10$dummy.hash.for.admin', -- Hash fictício (será usado apenas para controle interno)
  true
) ON CONFLICT (cpf_cnpj) DO NOTHING;

-- Agora vamos criar políticas RLS mais específicas para controle de acesso
-- Política para permitir que usuários vejam apenas seu próprio registro
DROP POLICY IF EXISTS "Users can view their own record" ON public.usuarios_sistema;
CREATE POLICY "Users can view their own record" 
  ON public.usuarios_sistema 
  FOR SELECT 
  USING (
    -- Usuário pode ver seu próprio registro baseado no email
    email = auth.jwt() ->> 'email' OR
    -- Administradores podem ver todos os registros
    EXISTS (
      SELECT 1 FROM public.usuarios_sistema u 
      WHERE u.email = auth.jwt() ->> 'email' 
      AND u.tipo_usuario = 'administrador'
      AND u.ativo = true
    )
  );

-- Política para permitir login (busca por email)
CREATE POLICY "Allow login lookup" 
  ON public.usuarios_sistema 
  FOR SELECT 
  USING (true); -- Permitir busca por email durante o login

-- Política para administradores gerenciarem todos os usuários
DROP POLICY IF EXISTS "Admins can manage all users" ON public.usuarios_sistema;
CREATE POLICY "Admins can manage all users" 
  ON public.usuarios_sistema 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_sistema u 
      WHERE u.email = auth.jwt() ->> 'email' 
      AND u.tipo_usuario = 'administrador'
      AND u.ativo = true
    )
  );
