
-- Criar enum para tipos de usuário
CREATE TYPE public.tipo_usuario AS ENUM ('administrador', 'usuario', 'cliente');

-- Criar enum para tipo de pessoa (física ou jurídica)
CREATE TYPE public.tipo_pessoa AS ENUM ('fisica', 'juridica');

-- Criar tabela usuarios_sistema
CREATE TABLE public.usuarios_sistema (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_usuario public.tipo_usuario NOT NULL,
  tipo_pessoa public.tipo_pessoa DEFAULT 'fisica',
  nome_completo TEXT NOT NULL,
  razao_social TEXT NULL, -- Apenas para pessoa jurídica
  nome_responsavel TEXT NULL, -- Apenas para pessoa jurídica
  cpf_cnpj TEXT NOT NULL UNIQUE,
  email TEXT NULL,
  senha_hash TEXT NULL, -- Apenas para administrador e usuário
  whatsapp TEXT NULL,
  
  -- Endereço completo
  endereco_cep TEXT NULL,
  endereco_rua TEXT NULL,
  endereco_numero TEXT NULL,
  endereco_complemento TEXT NULL,
  endereco_bairro TEXT NULL,
  endereco_cidade TEXT NULL,
  endereco_estado TEXT NULL,
  
  -- Permissões (JSON para usuários operacionais)
  permissoes JSONB DEFAULT '{}',
  
  -- Status
  ativo BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR email IS NULL),
  CONSTRAINT valid_cpf_cnpj_length CHECK (
    (tipo_pessoa = 'fisica' AND length(replace(replace(cpf_cnpj, '.', ''), '-', '')) = 11) OR
    (tipo_pessoa = 'juridica' AND length(replace(replace(replace(cpf_cnpj, '.', ''), '-', ''), '/', '')) = 14)
  ),
  CONSTRAINT admin_usuario_needs_email_senha CHECK (
    (tipo_usuario = 'cliente') OR 
    (tipo_usuario IN ('administrador', 'usuario') AND email IS NOT NULL AND senha_hash IS NOT NULL)
  ),
  CONSTRAINT juridica_needs_razao_social CHECK (
    (tipo_pessoa = 'fisica') OR 
    (tipo_pessoa = 'juridica' AND razao_social IS NOT NULL)
  )
);

-- Habilitar RLS
ALTER TABLE public.usuarios_sistema ENABLE ROW LEVEL SECURITY;

-- Política para administradores verem todos os registros
CREATE POLICY "Admins can view all users" 
  ON public.usuarios_sistema 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_sistema u 
      WHERE u.email = auth.jwt() ->> 'email' 
      AND u.tipo_usuario = 'administrador'
      AND u.ativo = true
    )
  );

-- Política para administradores criarem, editarem e excluírem registros
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

-- Política para usuários verem apenas seu próprio registro
CREATE POLICY "Users can view their own record" 
  ON public.usuarios_sistema 
  FOR SELECT 
  USING (email = auth.jwt() ->> 'email');

-- Índices para performance
CREATE INDEX idx_usuarios_sistema_tipo ON public.usuarios_sistema(tipo_usuario);
CREATE INDEX idx_usuarios_sistema_email ON public.usuarios_sistema(email);
CREATE INDEX idx_usuarios_sistema_cpf_cnpj ON public.usuarios_sistema(cpf_cnpj);
CREATE INDEX idx_usuarios_sistema_ativo ON public.usuarios_sistema(ativo);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_sistema_updated_at 
  BEFORE UPDATE ON public.usuarios_sistema 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
