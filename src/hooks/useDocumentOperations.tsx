
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeFileName, generateStorageFileName } from '@/utils/fileUtils';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import { useAuth } from '@/contexts/auth';
import type { DocumentoAnalisado } from './useDocumentosAnalisados';

export const useDocumentOperations = () => {
  const { toast } = useToast();
  const { registrarMovimentacao } = useMovimentacoes();
  const { user } = useAuth();

  const deleteFromGoogleDrive = async (documento: DocumentoAnalisado): Promise<boolean> => {
    if (!documento.google_drive_url) {
      console.log('Documento não tem URL do Google Drive, pulando deleção');
      return true; // Não é erro, apenas não há nada para deletar
    }

    try {
      console.log('Deletando arquivo do Google Drive:', documento.google_drive_url);
      
      const response = await supabase.functions.invoke('google-drive-delete', {
        body: {
          googleDriveUrl: documento.google_drive_url,
          fileName: documento.nome_arquivo,
          clientName: documento.nome_cliente || 'Cliente não identificado',
        },
      });

      console.log('Resposta da deleção no Google Drive:', response);

      if (response.error) {
        console.error('Erro na função de deleção do Google Drive:', response.error);
        throw new Error(response.error.message || 'Erro na função de deleção do Google Drive');
      }

      if (response.data?.success) {
        console.log('✓ Arquivo deletado do Google Drive com sucesso');
        return true;
      } else {
        console.error('Resposta de erro na deleção do Google Drive:', response.data);
        throw new Error(response.data?.error || 'Erro desconhecido na deleção do Google Drive');
      }
    } catch (error) {
      console.error('Erro ao deletar do Google Drive:', error);
      return false; // Retorna false mas não impede a deleção do Supabase
    }
  };

  const deleteDocument = async (
    documento: DocumentoAnalisado,
    onSuccess?: (documento: DocumentoAnalisado) => void
  ) => {
    try {
      console.log('Iniciando exclusão do documento:', documento.nome_arquivo);

      // Primeiro, tentar deletar do Google Drive (se existir)
      let driveDeleteSuccess = true;
      if (documento.google_drive_url) {
        console.log('Deletando do Google Drive...');
        driveDeleteSuccess = await deleteFromGoogleDrive(documento);
      }

      // Construir caminho do arquivo no Supabase Storage
      const clientFolderName = documento.nome_cliente ? sanitizeFileName(documento.nome_cliente) : documento.cliente_id;
      const storageFileName = generateStorageFileName(documento.nome_arquivo); // Usar nome sanitizado
      const filePath = `${clientFolderName}/${storageFileName}`;
      
      console.log('🔍 Debugging paths para deleção:', {
        clientFolderName,
        nomeArquivoOriginal: documento.nome_arquivo,
        storageFileName,
        filePath
      });
      
      console.log('Deletando arquivo do Supabase Storage:', filePath);

      // Deletar o arquivo do storage
      const { error: storageError } = await supabase.storage
        .from('analises-documentos')
        .remove([filePath]);

      if (storageError) {
        console.error('❌ Erro ao deletar arquivo do storage:', storageError);
        console.log('💡 Tentando com nome original do arquivo...');
        
        // Tentar com o nome original como fallback
        const fallbackPath = `${clientFolderName}/${documento.nome_arquivo}`;
        const { error: fallbackError } = await supabase.storage
          .from('analises-documentos')
          .remove([fallbackPath]);
          
        if (fallbackError) {
          console.error('❌ Erro também com nome original:', fallbackError);
          toast({
            title: "Erro ao deletar arquivo",
            description: `Erro no storage: ${storageError.message}`,
            variant: "destructive"
          });
          return;
        }
        console.log('✓ Arquivo deletado com nome original como fallback');
      } else {
        console.log('✓ Arquivo deletado do Supabase Storage com nome sanitizado');
      }

      console.log('✓ Arquivo deletado do Supabase Storage');

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

      console.log('✓ Registro deletado da base de dados');

      // Registrar movimentação
      await registrarMovimentacao(
        `Documento excluído: ${documento.nome_arquivo} (Cliente: ${documento.nome_cliente || 'N/A'})`,
        'documentos_analisados',
        documento,
        null,
        user?.email
      );

      // Mostrar toast baseado no resultado
      if (driveDeleteSuccess) {
        toast({
          title: "Documento deletado",
          description: "Documento removido com sucesso do Supabase e Google Drive!"
        });
      } else {
        toast({
          title: "Documento parcialmente deletado",
          description: "Documento removido do Supabase, mas houve erro ao deletar do Google Drive",
          variant: "destructive"
        });
      }

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
