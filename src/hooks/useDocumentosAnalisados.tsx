
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDocumentOperations } from './useDocumentOperations';
import type { Database } from '@/integrations/supabase/types';

export type DocumentoAnalisado = Database['public']['Tables']['documentos_analisados']['Row'];
export type DocumentoAnalisadoInsert = Database['public']['Tables']['documentos_analisados']['Insert'];

export const useDocumentosAnalisados = () => {
  const [documentos, setDocumentos] = useState<DocumentoAnalisado[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const { deleteDocument: deleteDoc, downloadAnalise, downloadPlano } = useDocumentOperations();

  // Real-time listener para atualizações de documentos
  useEffect(() => {
    let channel: any = null;

    const setupRealtime = () => {
      channel = supabase
        .channel('documentos-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'documentos_analisados'
          },
          (payload) => {
            if (payload.eventType === 'UPDATE') {
              const updatedDoc = payload.new as DocumentoAnalisado;
              setDocumentos(prev => {
                const exists = prev.find(doc => doc.id === updatedDoc.id);
                if (!exists) return prev;
                
                return prev.map(doc => 
                  doc.id === updatedDoc.id ? updatedDoc : doc
                );
              });

              // Mostrar toast quando status mudou para concluído
              if (updatedDoc.status === 'concluído') {
                toast({
                  title: "Análise concluída!",
                  description: `O documento "${updatedDoc.nome_arquivo}" foi analisado com sucesso.`,
                });
              }
            } else if (payload.eventType === 'INSERT') {
              const newDoc = payload.new as DocumentoAnalisado;
              setDocumentos(prev => {
                const exists = prev.find(doc => doc.id === newDoc.id);
                if (exists) return prev;
                return [newDoc, ...prev];
              });
            } else if (payload.eventType === 'DELETE') {
              const deletedDoc = payload.old as DocumentoAnalisado;
              setDocumentos(prev => prev.filter(doc => doc.id !== deletedDoc.id));
            }
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [toast]);

  const fetchDocumentos = useCallback(async (clienteId?: string) => {
    if (loading) return; // Evita múltiplas chamadas simultâneas
    
    try {
      setLoading(true);
      
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
  }, [loading, toast]);

  const deleteDocument = async (documento: DocumentoAnalisado) => {
    await deleteDoc(documento, () => {
      setDocumentos(prev => prev.filter(doc => doc.id !== documento.id));
    });
  };

  return {
    documentos,
    loading,
    fetchDocumentos,
    deleteDocument,
    downloadAnalise,
    downloadPlano
  };
};
