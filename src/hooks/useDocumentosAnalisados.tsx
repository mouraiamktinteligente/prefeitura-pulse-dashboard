
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

export type DocumentoAnalisado = Database['public']['Tables']['documentos_analisados']['Row'];
export type DocumentoAnalisadoInsert = Database['public']['Tables']['documentos_analisados']['Insert'];

export const useDocumentosAnalisados = () => {
  const [documentos, setDocumentos] = useState<DocumentoAnalisado[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDocumentos = async (clienteId?: string) => {
    try {
      setLoading(true);
      console.log('Buscando documentos...', clienteId ? `para cliente: ${clienteId}` : 'todos');
      
      let query = supabase
        .from('documentos_analisados')
        .select('*')
        .order('created_at', { ascending: false });

      if (clienteId) {
        query = query.eq('cliente_id', clienteId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar documentos:', error);
        toast({
          title: "Erro ao carregar documentos",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Documentos carregados:', data?.length || 0);
      setDocumentos(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao carregar documentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (
    clienteId: string,
    file: File
  ): Promise<DocumentoAnalisado | null> => {
    try {
      console.log('Iniciando upload do documento:', file.name);

      // Detectar tipo de arquivo
      const tipoArquivo = file.type.includes('pdf') ? 'PDF' : 
                         file.type.includes('text') ? 'TXT' :
                         file.type.includes('image') ? 'Imagem' : 'Outros';

      // Upload para o Supabase Storage
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `analises/${clienteId}/${fileName}`;

      console.log('Fazendo upload para:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('analises-documentos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        toast({
          title: "Erro no upload",
          description: uploadError.message,
          variant: "destructive"
        });
        return null;
      }

      console.log('Upload realizado com sucesso:', uploadData);

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('analises-documentos')
        .getPublicUrl(filePath);

      console.log('URL do arquivo:', urlData.publicUrl);

      // Registrar na tabela documentos_analisados
      const documentData: DocumentoAnalisadoInsert = {
        cliente_id: clienteId,
        nome_arquivo: file.name,
        tipo_arquivo: tipoArquivo,
        url_original: urlData.publicUrl,
        status: 'pendente'
      };

      const { data: docData, error: docError } = await supabase
        .from('documentos_analisados')
        .insert([documentData])
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

      console.log('Documento registrado:', docData);
      toast({
        title: "Upload realizado",
        description: "Documento enviado com sucesso!"
      });

      // Atualizar lista local
      setDocumentos(prev => [docData, ...prev]);

      return docData;
    } catch (error) {
      console.error('Erro inesperado no upload:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao fazer upload do documento",
        variant: "destructive"
      });
      return null;
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
    documentos,
    loading,
    fetchDocumentos,
    uploadDocument,
    downloadAnalise
  };
};
