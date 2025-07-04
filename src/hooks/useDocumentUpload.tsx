
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { detectFileType, generateUniqueFileName } from '@/utils/fileUtils';
import type { DocumentoAnalisado, DocumentoAnalisadoInsert } from './useDocumentosAnalisados';

export const useDocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadToGoogleDrive = async (file: File, clientName: string): Promise<string | null> => {
    try {
      console.log('Enviando arquivo para Google Drive:', file.name);

      // Convert file to base64
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await supabase.functions.invoke('google-drive-upload', {
        body: {
          fileName: file.name,
          fileData,
          clientName,
          mimeType: file.type,
        },
      });

      if (response.error) {
        console.error('Erro na função do Google Drive:', response.error);
        return null;
      }

      if (response.data?.success) {
        console.log('Arquivo enviado com sucesso para Google Drive:', response.data.file.webViewLink);
        return response.data.file.webViewLink;
      } else {
        console.error('Resposta de erro do Google Drive:', response.data);
        return null;
      }
    } catch (error) {
      console.error('Erro ao enviar para Google Drive:', error);
      return null;
    }
  };

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

      // Upload simultâneo para Supabase Storage e Google Drive
      const [supabaseResult, googleDriveUrl] = await Promise.allSettled([
        // Upload para Supabase Storage
        supabase.storage
          .from('analises-documentos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          }),
        // Upload para Google Drive
        uploadToGoogleDrive(file, clienteNome)
      ]);

      // Verificar resultado do Supabase
      if (supabaseResult.status === 'rejected' || supabaseResult.value.error) {
        const error = supabaseResult.status === 'rejected' 
          ? supabaseResult.reason 
          : supabaseResult.value.error;
        console.error('Erro detalhado no upload para Supabase:', error);
        toast({
          title: "Erro no upload para Supabase",
          description: error.message || 'Erro desconhecido',
          variant: "destructive"
        });
        return null;
      }

      console.log('Upload realizado com sucesso no Supabase:', supabaseResult.value.data);

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

      // Verificar resultado do Google Drive
      let driveUrl: string | null = null;
      if (googleDriveUrl.status === 'fulfilled') {
        driveUrl = googleDriveUrl.value;
        console.log('Upload para Google Drive bem-sucedido:', driveUrl);
      } else {
        console.error('Erro no upload para Google Drive:', googleDriveUrl.reason);
        // Não falha o processo todo, apenas informa
        toast({
          title: "Aviso",
          description: "Arquivo salvo no Supabase, mas falhou no Google Drive",
          variant: "default"
        });
      }

      // Criar o documento com ambas as URLs
      const documentData: DocumentoAnalisadoInsert = {
        cliente_id: clienteId,
        nome_arquivo: fileName,
        tipo_arquivo: tipoArquivo,
        status: 'pendente',
        url_original: signedUrlData.signedUrl,
        nome_cliente: clienteNome,
        google_drive_url: driveUrl
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
      
      const successMessage = driveUrl 
        ? "Documento enviado com sucesso para Supabase e Google Drive!"
        : "Documento enviado com sucesso para Supabase!";
      
      toast({
        title: "Upload realizado",
        description: successMessage
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
