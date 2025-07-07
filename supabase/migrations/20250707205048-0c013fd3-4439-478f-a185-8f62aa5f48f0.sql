-- Criar tabela para registro de movimentações/auditoria
CREATE TABLE public.registro_movimentacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_usuario TEXT NOT NULL,
  data_hora_acao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acao_realizada TEXT NOT NULL,
  tabela_afetada TEXT,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.registro_movimentacoes ENABLE ROW LEVEL SECURITY;

-- Política para apenas administradores visualizarem
CREATE POLICY "Apenas administradores podem visualizar movimentações"
ON public.registro_movimentacoes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.usuarios_sistema 
    WHERE email = (auth.jwt() ->> 'email'::text) 
    AND tipo_usuario = 'administrador' 
    AND ativo = true
  )
);

-- Política para inserção (sistema pode inserir logs)
CREATE POLICY "Sistema pode inserir logs de movimentação"
ON public.registro_movimentacoes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Índices para performance
CREATE INDEX idx_registro_movimentacoes_email ON public.registro_movimentacoes(email_usuario);
CREATE INDEX idx_registro_movimentacoes_data ON public.registro_movimentacoes(data_hora_acao);
CREATE INDEX idx_registro_movimentacoes_acao ON public.registro_movimentacoes USING gin(to_tsvector('portuguese', acao_realizada));
CREATE INDEX idx_registro_movimentacoes_tabela ON public.registro_movimentacoes(tabela_afetada);

-- Trigger para updated_at
CREATE TRIGGER update_registro_movimentacoes_updated_at
BEFORE UPDATE ON public.registro_movimentacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();