
-- Criar tabela para cadastro de clientes
CREATE TABLE public.cadastro_clientes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_pessoa public.tipo_pessoa NOT NULL DEFAULT 'fisica',
  nome_completo text NOT NULL,
  razao_social text,
  nome_responsavel text,
  cpf_cnpj text NOT NULL,
  email text,
  whatsapp text,
  instagram text,
  endereco_cep text,
  endereco_rua text,
  endereco_numero text,
  endereco_complemento text,
  endereco_bairro text,
  endereco_cidade text,
  endereco_estado text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.cadastro_clientes ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas (acesso completo para usuários autenticados)
CREATE POLICY "Usuários autenticados podem visualizar clientes" 
  ON public.cadastro_clientes 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir clientes" 
  ON public.cadastro_clientes 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar clientes" 
  ON public.cadastro_clientes 
  FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Usuários autenticados podem excluir clientes" 
  ON public.cadastro_clientes 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Criar trigger para atualização automática do updated_at
CREATE TRIGGER update_cadastro_clientes_updated_at
  BEFORE UPDATE ON public.cadastro_clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índice para busca rápida por CPF/CNPJ
CREATE INDEX idx_cadastro_clientes_cpf_cnpj ON public.cadastro_clientes(cpf_cnpj);

-- Criar índice para busca por nome
CREATE INDEX idx_cadastro_clientes_nome ON public.cadastro_clientes(nome_completo);
