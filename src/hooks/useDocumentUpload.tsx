import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { detectFileType, generateUniqueFileName } from '@/utils/fileUtils';
import type { DocumentoAnalisado, DocumentoAnalisadoInsert } from './useDocumentosAnalisados';

export const useDocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Função para obter timestamp no timezone de São Paulo
  const getSaoPauloTimestamp = (): string => {
    const now = new Date();
    const saoPauloTime = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(now);
    
    // Adicionar milissegundos manualmente
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    return saoPauloTime.replace(' ', 'T') + '.' + milliseconds + '-03:00';
  };

  const uploadToGoogleDrive = async (file: File, clientName: string): Promise<string | null> => {
    try {
      console.log('=== INICIANDO UPLOAD PARA GOOGLE DRIVE ===');
      console.log('Arquivo:', file.name, 'Tamanho:', file.size, 'Tipo:', file.type);
      console.log('Cliente:', clientName);

      // Convert file to base64
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          console.log('Arquivo convertido para base64, tamanho:', base64.length);
          resolve(base64);
        };
        reader.onerror = (error) => {
          console.error('Erro ao ler arquivo:', error);
          reject(error);
        };
        reader.readAsDataURL(file);
      });

      console.log('Chamando função do Google Drive...');
      const response = await supabase.functions.invoke('google-drive-upload', {
        body: {
          fileName: file.name,
          fileData,
          clientName,
          mimeType: file.type,
        },
      });

      console.log('Resposta da função:', response);

      if (response.error) {
        console.error('Erro na função do Google Drive:', response.error);
        throw new Error(response.error.message || 'Erro na função do Google Drive');
      }

      if (response.data?.success) {
        console.log('✓ Upload para Google Drive bem-sucedido:', response.data.file.webViewLink);
        return response.data.file.webViewLink;
      } else {
        console.error('Resposta de erro do Google Drive:', response.data);
        throw new Error(response.data?.error || 'Erro desconhecido no Google Drive');
      }
    } catch (error) {
      console.error('=== ERRO NO UPLOAD PARA GOOGLE DRIVE ===');
      console.error('Erro completo:', error);
      throw error;
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
      console.log('=== INICIANDO UPLOAD DO DOCUMENTO ===');
      console.log('Cliente ID:', clienteId);
      console.log('Cliente Nome:', clienteNome);
      console.log('Arquivo:', file.name, 'Tamanho:', file.size);

      const tipoArquivo = detectFileType(file);
      const originalName = file.name;
      const fileName = generateUniqueFileName(originalName);
      const filePath = `${clienteId}/${fileName}`;

      console.log('Arquivo processado:', { originalName, fileName, filePath, tipoArquivo });

      // Upload simultâneo para Supabase Storage e Google Drive
      console.log('Iniciando uploads simultâneos...');
      
      const [supabaseResult, googleDriveResult] = await Promise.allSettled([
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
      if (supabaseResult.status === 'rejected') {
        console.error('Upload para Supabase rejeitado:', supabaseResult.reason);
        throw new Error(`Erro no Supabase: ${supabaseResult.reason.message}`);
      }

      if (supabaseResult.value.error) {
        console.error('Erro no upload para Supabase:', supabaseResult.value.error);
        throw new Error(`Erro no Supabase: ${supabaseResult.value.error.message}`);
      }

      console.log('✓ Upload para Supabase bem-sucedido:', supabaseResult.value.data);

      // Gerar URL assinada temporária (1 dia de validade = 86400 segundos)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('analises-documentos')
        .createSignedUrl(filePath, 86400);

      if (signedUrlError) {
        console.error('Erro ao gerar URL assinada:', signedUrlError);
        throw new Error(`Erro na URL assinada: ${signedUrlError.message}`);
      }

      console.log('✓ URL assinada gerada:', signedUrlData.signedUrl);

      // Verificar resultado do Google Drive
      let driveUrl: string | null = null;
      let driveError: string | null = null;

      if (googleDriveResult.status === 'fulfilled') {
        driveUrl = googleDriveResult.value;
        console.log('✓ Upload para Google Drive bem-sucedido:', driveUrl);
      } else {
        driveError = googleDriveResult.reason.message;
        console.error('❌ Erro no upload para Google Drive:', driveError);
      }

      // Usar timestamp de São Paulo
      const saoPauloTimestamp = getSaoPauloTimestamp();
      console.log('Timestamp São Paulo:', saoPauloTimestamp);

      // Criar o documento com ambas as URLs
      const documentData: DocumentoAnalisadoInsert = {
        cliente_id: clienteId,
        nome_arquivo: fileName,
        tipo_arquivo: tipoArquivo,
        status: 'pendente',
        url_original: signedUrlData.signedUrl,
        nome_cliente: clienteNome,
        google_drive_url: driveUrl,
        data_upload: saoPauloTimestamp,
        created_at: saoPauloTimestamp,
        updated_at: saoPauloTimestamp
      };

      console.log('Inserindo documento na base de dados:', documentData);

      const { data: docData, error: docError } = await supabase
        .from('documentos_analisados')
        .insert(documentData)
        .select()
        .single();

      if (docError) {
        console.error('Erro ao registrar documento:', docError);
        throw new Error(`Erro ao registrar: ${docError.message}`);
      }

      console.log('✓ Documento registrado com sucesso:', docData);
      
      // Mostrar toast baseado no resultado
      if (driveUrl) {
        toast({
          title: "Upload realizado com sucesso!",
          description: "Documento salvo no Supabase e Google Drive",
        });
      } else {
        toast({
          title: "Upload parcialmente realizado",
          description: `Documento salvo no Supabase, mas falhou no Google Drive: ${driveError}`,
          variant: "destructive"
        });
      }

      onSuccess?.(docData);
      return docData;
    } catch (error) {
      console.error('=== ERRO GERAL NO UPLOAD ===');
      console.error('Erro completo:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Erro desconhecido ao fazer upload do documento",
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
