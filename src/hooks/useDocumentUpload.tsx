
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

      // Upload para Supabase Storage
      console.log('Iniciando upload para Supabase...');
      
      const { data: supabaseData, error: supabaseError } = await supabase.storage
        .from('analises-documentos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (supabaseError) {
        console.error('Erro no upload para Supabase:', supabaseError);
        throw new Error(`Erro no Supabase: ${supabaseError.message}`);
      }

      console.log('✓ Upload para Supabase bem-sucedido:', supabaseData);

      // Gerar URL assinada temporária (1 dia de validade = 86400 segundos)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('analises-documentos')
        .createSignedUrl(filePath, 86400);

      if (signedUrlError) {
        console.error('Erro ao gerar URL assinada:', signedUrlError);
        throw new Error(`Erro na URL assinada: ${signedUrlError.message}`);
      }

      console.log('✓ URL assinada gerada:', signedUrlData.signedUrl);


      // Usar timestamp correto de São Paulo
      const saoPauloTimestamp = getSaoPauloTimestamp();
      console.log('🕐 Timestamp para banco de dados:', saoPauloTimestamp);

      // Criar o documento apenas com dados do Supabase
      const documentData: DocumentoAnalisadoInsert = {
        cliente_id: clienteId,
        nome_arquivo: readableFileName,
        tipo_arquivo: tipoArquivo,
        status: 'pendente',
        url_original: signedUrlData.signedUrl,
        nome_cliente: clienteNome,
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
      
      // Mostrar toast de sucesso
      toast({
        title: "Upload realizado com sucesso!",
        description: `Documento salvo na pasta: ${clientFolderName}`,
      });

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
