
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { DocumentoAnalisado } from './useDocumentosAnalisados';

export const useDocumentOperations = () => {
  const { toast } = useToast();

  const deleteDocument = async (
    documento: DocumentoAnalisado,
    onSuccess?: (documento: DocumentoAnalisado) => void
  ) => {
    try {
      console.log('Iniciando exclusão do documento:', documento.nome_arquivo);

      // Deletar o arquivo do storage
      const filePath = `${documento.cliente_id}/${documento.nome_arquivo}`;
      const { error: storageError } = await supabase.storage
        .from('analises-documentos')
        .remove([filePath]);

      if (storageError) {
        console.error('Erro ao deletar arquivo do storage:', storageError);
        toast({
          title: "Erro ao deletar arquivo",
          description: storageError.message,
          variant: "destructive"
        });
        return;
      }

      // Deletar o registro da tabela
      const { error: dbError } = await supabase
        .from('documentos_analisados')
        .delete()
        .eq('id', documento.id);

      if (dbError) {
        console.error('Erro ao deletar registro:', dbError);
        toast({
          title: "Erro ao deletar registro",
          description: dbError.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Documento deletado com sucesso');
      toast({
        title: "Documento deletado",
        description: "Documento removido com sucesso!"
      });

      onSuccess?.(documento);
    } catch (error) {
      console.error('Erro inesperado na exclusão:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao deletar documento",
        variant: "destructive"
      });
    }
  };

  const downloadAnalise = async (documento: DocumentoAnalisado) => {
    if (!documento.url_analise) {
      toast({
        title: "Análise não disponível",
        description: "A análise ainda não foi finalizada",
        variant: "destructive"
      });
      return;
    }

    try {
      window.open(documento.url_analise, '_blank');
    } catch (error) {
      console.error('Erro ao baixar análise:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar a análise",
        variant: "destructive"
      });
    }
  };

  return {
    deleteDocument,
    downloadAnalise
  };
};
