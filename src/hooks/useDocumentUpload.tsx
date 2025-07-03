
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { detectFileType, generateUniqueFileName } from '@/utils/fileUtils';
import type { DocumentoAnalisado, DocumentoAnalisadoInsert } from './useDocumentosAnalisados';

export const useDocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadDocument = async (
    clienteId: string,
    file: File,
    clienteNome: string,
    onSuccess?: (documento: DocumentoAnalisado) => void
  ): Promise<DocumentoAnalisado | null> => {
    try {
      setUploading(true);
      console.log('Iniciando upload do documento:', file.name, 'para cliente:', clienteNome);

      const tipoArquivo = detectFileType(file);
      const originalName = file.name;
      const fileName = generateUniqueFileName(originalName);
      const filePath = `${clienteId}/${fileName}`;

      console.log('Nome original:', originalName);
      console.log('Nome sanitizado:', fileName);
      console.log('Fazendo upload para:', filePath);
      console.log('Tamanho do arquivo:', file.size, 'bytes');
      console.log('Tipo do arquivo:', file.type);

      // Upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('analises-documentos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro detalhado no upload:', uploadError);
        console.error('Mensagem do erro:', uploadError.message);
        toast({
          title: "Erro no upload",
          description: uploadError.message,
          variant: "destructive"
        });
        return null;
      }

      console.log('Upload realizado com sucesso:', uploadData);

      // Gerar URL assinada temporária (1 dia de validade = 86400 segundos)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('analises-documentos')
        .createSignedUrl(filePath, 86400);

      if (signedUrlError) {
        console.error('Erro ao gerar URL assinada:', signedUrlError);
        toast({
          title: "Erro ao gerar URL de acesso",
          description: signedUrlError.message,
          variant: "destructive"
        });
        return null;
      }

      console.log('URL assinada gerada:', signedUrlData.signedUrl);

      // Criar o documento com a URL assinada e nome do cliente
      const documentData: DocumentoAnalisadoInsert = {
        cliente_id: clienteId,
        nome_arquivo: fileName,
        tipo_arquivo: tipoArquivo,
        status: 'pendente',
        url_original: signedUrlData.signedUrl,
        nome_cliente: clienteNome
      };

      console.log('Dados do documento a serem inseridos:', documentData);

      const { data: docData, error: docError } = await supabase
        .from('documentos_analisados')
        .insert(documentData)
        .select()
        .single();

      if (docError) {
        console.error('Erro ao registrar documento:', docError);
        toast({
          title: "Erro ao registrar documento",
          description: docError.message,
          variant: "destructive"
        });
        return null;
      }

      console.log('Documento registrado com sucesso:', docData);
      toast({
        title: "Upload realizado",
        description: "Documento enviado com sucesso!"
      });

      onSuccess?.(docData);
      return docData;
    } catch (error) {
      console.error('Erro inesperado no upload:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao fazer upload do documento",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadDocument
  };
};
