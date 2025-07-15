
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { detectFileType, generateReadableFileName, sanitizeFileName } from '@/utils/fileUtils';
import type { DocumentoAnalisado, DocumentoAnalisadoInsert } from './useDocumentosAnalisados';

export const useDocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Função para obter timestamp CORRETO no timezone de São Paulo
  const getSaoPauloTimestamp = (): string => {
    // Criar data atual
    const now = new Date();
    
    // Ajustar para São Paulo (UTC-3)
    const saoPauloOffset = -3; // UTC-3
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const saoPauloTime = new Date(utc + (saoPauloOffset * 3600000));
    
    // Formatar manualmente para garantir formato correto
    const year = saoPauloTime.getFullYear();
    const month = String(saoPauloTime.getMonth() + 1).padStart(2, '0');
    const day = String(saoPauloTime.getDate()).padStart(2, '0');
    const hours = String(saoPauloTime.getHours()).padStart(2, '0');
    const minutes = String(saoPauloTime.getMinutes()).padStart(2, '0');
    const seconds = String(saoPauloTime.getSeconds()).padStart(2, '0');
    const milliseconds = String(saoPauloTime.getMilliseconds()).padStart(3, '0');
    
    const timestamp = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}-03:00`;
    console.log('🕐 Timestamp São Paulo gerado:', timestamp);
    return timestamp;
  };

  const uploadToGoogleDrive = async (file: File, folderId: string): Promise<{webViewLink: string, folderId: string} | null> => {
    try {
      console.log('=== INICIANDO UPLOAD PARA GOOGLE DRIVE ===');
      console.log('Arquivo:', file.name, 'Tamanho:', file.size, 'Tipo:', file.type);
      console.log('ID da pasta Google Drive:', folderId);

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
          folderId: folderId, // Usar ID da pasta diretamente
          mimeType: file.type,
        },
      });

      console.log('Resposta da função Google Drive:', response);

      if (response.error) {
        console.error('Erro na função do Google Drive:', response.error);
        throw new Error(response.error.message || 'Erro na função do Google Drive');
      }

      if (response.data?.success) {
        console.log('✓ Upload para Google Drive bem-sucedido:', response.data.file.webViewLink);
        console.log('✓ ID da pasta no Google Drive:', response.data.folderId);
        return { webViewLink: response.data.file.webViewLink, folderId: response.data.folderId };
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

      // Buscar o id_folder_drive do cliente
      console.log('📁 Buscando id_folder_drive do cliente...');
      const { data: clienteData, error: clienteError } = await supabase
        .from('cadastro_clientes')
        .select('id_folder_drive')
        .eq('id', clienteId)
        .single();

      if (clienteError) {
        console.error('Erro ao buscar cliente:', clienteError);
        throw new Error(`Erro ao buscar dados do cliente: ${clienteError.message}`);
      }

      if (!clienteData?.id_folder_drive) {
        console.error('Cliente não possui id_folder_drive configurado');
        throw new Error('Cliente não possui pasta do Google Drive configurada. Configure a pasta nas informações do cliente.');
      }

      console.log('✓ ID da pasta do Google Drive encontrado:', clienteData.id_folder_drive);

      const tipoArquivo = detectFileType(file);
      const originalName = file.name;
      const readableFileName = generateReadableFileName(originalName);
      
      // Estrutura melhorada: criar pasta com nome sanitizado do cliente
      const clientFolderName = sanitizeFileName(clienteNome);
      const filePath = `${clientFolderName}/${readableFileName}`;

      console.log('📁 Estrutura do arquivo:', { 
        originalName, 
        readableFileName, 
        clientFolderName,
        filePath, 
        tipoArquivo 
      });

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
        // Upload para Google Drive usando o id_folder_drive
        uploadToGoogleDrive(file, clienteData.id_folder_drive)
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
      let driveFolderId: string | null = null;
      let driveError: string | null = null;

      if (googleDriveResult.status === 'fulfilled' && googleDriveResult.value) {
        driveUrl = googleDriveResult.value.webViewLink;
        driveFolderId = googleDriveResult.value.folderId;
        console.log('✓ Upload para Google Drive bem-sucedido:', driveUrl);
        console.log('✓ ID da pasta no Google Drive:', driveFolderId);
      } else if (googleDriveResult.status === 'rejected') {
        driveError = googleDriveResult.reason.message || 'Erro desconhecido no Google Drive';
        console.error('❌ Erro no upload para Google Drive:', driveError);
      }

      // Usar timestamp correto de São Paulo
      const saoPauloTimestamp = getSaoPauloTimestamp();
      console.log('🕐 Timestamp para banco de dados:', saoPauloTimestamp);

      // Criar o documento com ambas as URLs e o ID da pasta
      const documentData: DocumentoAnalisadoInsert = {
        cliente_id: clienteId,
        nome_arquivo: readableFileName,
        tipo_arquivo: tipoArquivo,
        status: 'pendente',
        url_original: signedUrlData.signedUrl,
        nome_cliente: clienteNome,
        google_drive_url: driveUrl,
        drive_folder_id: driveFolderId,
        data_upload: saoPauloTimestamp,
        created_at: saoPauloTimestamp,
        updated_at: saoPauloTimestamp
      };

      console.log('💾 Inserindo documento na base de dados:', documentData);

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
          description: `Documento salvo no Supabase (pasta: ${clientFolderName}) e Google Drive`,
        });
      } else {
        toast({
          title: "Upload realizado com sucesso",
          description: `Documento salvo no Supabase. Google Drive: ${driveError || 'Erro na configuração do Google Drive'}`,
          variant: "default"
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
