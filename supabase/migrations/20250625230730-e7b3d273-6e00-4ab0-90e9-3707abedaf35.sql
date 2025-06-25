
-- Criar função para gerar a URL original automaticamente
CREATE OR REPLACE FUNCTION generate_url_original()
RETURNS TRIGGER AS $$
BEGIN
  -- Gerar a URL original no formato especificado
  NEW.url_original := 'https://oztosavtfiifjaahpagf.supabase.co/storage/v1/object/public/analises-documentos/' || NEW.cliente_id || '/' || NEW.nome_arquivo;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para executar a função antes do INSERT
CREATE TRIGGER trigger_generate_url_original
  BEFORE INSERT ON public.documentos_analisados
  FOR EACH ROW
  EXECUTE FUNCTION generate_url_original();
