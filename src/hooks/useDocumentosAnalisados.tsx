
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDocumentUpload } from './useDocumentUpload';
import { useDocumentOperations } from './useDocumentOperations';
import type { Database } from '@/integrations/supabase/types';

export type DocumentoAnalisado = Database['public']['Tables']['documentos_analisados']['Row'];
export type DocumentoAnalisadoInsert = Database['public']['Tables']['documentos_analisados']['Insert'];

export const useDocumentosAnalisados = () => {
  const [documentos, setDocumentos] = useState<DocumentoAnalisado[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const { uploading, uploadDocument: uploadDoc } = useDocumentUpload();
  const { deleteDocument: deleteDoc, downloadAnalise } = useDocumentOperations();

  // Real-time listener para atualizações de documentos
  useEffect(() => {
    const channel = supabase
      .channel('documentos-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documentos_analisados'
        },
        (payload) => {
          console.log('📡 Documento atualizado em tempo real:', payload);
          const updatedDoc = payload.new as DocumentoAnalisado;
          
          setDocumentos(prev => 
            prev.map(doc => 
              doc.id === updatedDoc.id ? updatedDoc : doc
            )
          );

          // Mostrar toast quando status mudou para concluído
          if (updatedDoc.status === 'concluído') {
            toast({
              title: "Análise concluída!",
              description: `O documento "${updatedDoc.nome_arquivo}" foi analisado com sucesso.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

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
    file: File,
    clienteNome: string
  ): Promise<DocumentoAnalisado | null> => {
    const result = await uploadDoc(clienteId, file, clienteNome, (documento) => {
      setDocumentos(prev => [documento, ...prev]);
    });
    return result;
  };

  const deleteDocument = async (documento: DocumentoAnalisado) => {
    await deleteDoc(documento, () => {
      setDocumentos(prev => prev.filter(doc => doc.id !== documento.id));
    });
  };

  return {
    documentos,
    loading: loading || uploading,
    fetchDocumentos,
    uploadDocument,
    deleteDocument,
    downloadAnalise
  };
};
