
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import type { Cliente } from './useClients';

export const useClientsFetch = () => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const fetchingRef = useRef(false);

  const fetchClients = useCallback(async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (fetchingRef.current || !user) {
      return;
    }

    try {
      console.log('Buscando clientes...');
      fetchingRef.current = true;
      setLoading(true);

      const { data, error } = await supabase
        .from('cadastro_clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar clientes:', error);
        toast({
          title: "Erro ao carregar clientes",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Clientes encontrados:', data?.length || 0);
      setClients(data || []);
      setInitialized(true);
    } catch (error) {
      console.error('Erro inesperado na busca:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao carregar dados dos clientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user]); // Removido toast das dependências para estabilizar

  // Setup realtime subscription - separado e estabilizado
  useEffect(() => {
    if (!user || !initialized) return;

    console.log('Configurando subscription realtime para clientes...');

    const channel = supabase
      .channel('cadastro_clientes_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cadastro_clientes'
        },
        (payload) => {
          console.log('Cliente inserido:', payload.new);
          const newClient = payload.new as Cliente;
          setClients(prev => [newClient, ...prev]);
          
          toast({
            title: "Novo cliente cadastrado",
            description: `${newClient.nome_completo} foi adicionado`,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cadastro_clientes'
        },
        (payload) => {
          console.log('Cliente atualizado:', payload.new);
          const updatedClient = payload.new as Cliente;
          setClients(prev => 
            prev.map(client => 
              client.id === updatedClient.id ? updatedClient : client
            )
          );
          
          toast({
            title: "Cliente atualizado",
            description: `${updatedClient.nome_completo} foi modificado`,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'cadastro_clientes'
        },
        (payload) => {
          console.log('Cliente excluído:', payload.old);
          const deletedClient = payload.old as Cliente;
          setClients(prev => 
            prev.filter(client => client.id !== deletedClient.id)
          );
          // Toast removido para evitar duplicação - o useClientOperations já mostra
        }
      )
      .subscribe();

    console.log('Subscription realtime configurada com sucesso');

    // Cleanup subscription on unmount
    return () => {
      console.log('Removendo subscription realtime...');
      supabase.removeChannel(channel);
    };
  }, [user, initialized]); // Removido toast das dependências

  return {
    clients,
    setClients,
    loading,
    fetchClients,
    initialized
  };
};
