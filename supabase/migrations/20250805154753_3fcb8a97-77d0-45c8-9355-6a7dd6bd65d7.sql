-- Criar tabela marketing_campanhas
CREATE TABLE public.marketing_campanhas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL,
  tipo_solicitacao TEXT NOT NULL CHECK (tipo_solicitacao IN ('analise', 'descricao_personalizada')),
  documento_analise_id UUID NULL,
  descricao_personalizada TEXT NULL,
  tipo_postagem TEXT NOT NULL CHECK (tipo_postagem IN ('feed', 'story', 'ambos')),
  status_campanha TEXT NOT NULL DEFAULT 'enviada' CHECK (status_campanha IN ('enviada', 'processando', 'concluida', 'erro')),
  usuario_solicitante TEXT NOT NULL,
  webhook_enviado_em TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (cliente_id) REFERENCES public.cadastro_clientes(id),
  FOREIGN KEY (documento_analise_id) REFERENCES public.documentos_analisados(id)
);

-- Criar tabela marketing_imagens
CREATE TABLE public.marketing_imagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campanha_id UUID NOT NULL,
  url_imagem TEXT NOT NULL,
  tipo_imagem TEXT NOT NULL CHECK (tipo_imagem IN ('feed', 'story')),
  status_aprovacao TEXT NOT NULL DEFAULT 'pendente' CHECK (status_aprovacao IN ('pendente', 'aprovada', 'rejeitada')),
  observacoes_rejeicao TEXT NULL,
  versao INTEGER NOT NULL DEFAULT 1,
  metadata_adicional JSONB NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  aprovado_por TEXT NULL,
  data_aprovacao TIMESTAMP WITH TIME ZONE NULL,
  FOREIGN KEY (campanha_id) REFERENCES public.marketing_campanhas(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE public.marketing_campanhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_imagens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para marketing_campanhas
CREATE POLICY "Usuários podem visualizar campanhas de marketing" 
ON public.marketing_campanhas 
FOR SELECT 
USING (true);

CREATE POLICY "Usuários podem criar campanhas de marketing" 
ON public.marketing_campanhas 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar campanhas de marketing" 
ON public.marketing_campanhas 
FOR UPDATE 
USING (true);

-- Políticas RLS para marketing_imagens  
CREATE POLICY "Usuários podem visualizar imagens de marketing" 
ON public.marketing_imagens 
FOR SELECT 
USING (true);

CREATE POLICY "Sistema pode inserir imagens de marketing" 
ON public.marketing_imagens 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar aprovação de imagens" 
ON public.marketing_imagens 
FOR UPDATE 
USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_marketing_campanhas_updated_at
BEFORE UPDATE ON public.marketing_campanhas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_marketing_campanhas_cliente_id ON public.marketing_campanhas(cliente_id);
CREATE INDEX idx_marketing_campanhas_status ON public.marketing_campanhas(status_campanha);
CREATE INDEX idx_marketing_imagens_campanha_id ON public.marketing_imagens(campanha_id);
CREATE INDEX idx_marketing_imagens_status ON public.marketing_imagens(status_aprovacao);