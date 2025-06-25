
-- Criar tabela para documentos analisados
CREATE TABLE public.documentos_analisados (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id uuid NOT NULL REFERENCES public.cadastro_clientes(id) ON DELETE CASCADE,
  nome_arquivo text NOT NULL,
  tipo_arquivo text NOT NULL,
  url_original text NOT NULL,
  url_analise text,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'processando', 'finalizado', 'erro')),
  data_upload timestamp with time zone NOT NULL DEFAULT now(),
  data_finalizacao timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.documentos_analisados ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso completo
CREATE POLICY "Permitir acesso completo aos documentos" 
  ON public.documentos_analisados 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Criar trigger para atualização automática do updated_at
CREATE TRIGGER update_documentos_analisados_updated_at
  BEFORE UPDATE ON public.documentos_analisados
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para performance
CREATE INDEX idx_documentos_analisados_cliente_id ON public.documentos_analisados(cliente_id);
CREATE INDEX idx_documentos_analisados_status ON public.documentos_analisados(status);

-- Criar bucket para armazenar os arquivos de análise
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'analises-documentos', 
  'analises-documentos', 
  false, 
  52428800, -- 50MB
  ARRAY['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/jpg']
);

-- Criar políticas de storage
CREATE POLICY "Permitir upload de arquivos" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'analises-documentos');

CREATE POLICY "Permitir leitura de arquivos" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'analises-documentos');

CREATE POLICY "Permitir atualização de arquivos" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'analises-documentos');

CREATE POLICY "Permitir exclusão de arquivos" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'analises-documentos');
