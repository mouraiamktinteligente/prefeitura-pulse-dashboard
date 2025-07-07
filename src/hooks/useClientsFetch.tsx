
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { Cliente } from './useClients';

export const useClientsFetch = () => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchClients = async () => {
    try {
      console.log('Buscando clientes...');
      
      if (!user) {
        console.log('Usuário não autenticado no sistema customizado');
        toast({
          title: "Erro de autenticação",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      console.log('Usuário autenticado:', user.email);

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
    } catch (error) {
      console.error('Erro inesperado na busca:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao carregar dados dos clientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    if (!user) return;

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
          
          toast({
            title: "Cliente excluído",
            description: `${deletedClient.nome_completo} foi removido`,
          });
        }
      )
      .subscribe();

    console.log('Subscription realtime configurada com sucesso');

    // Cleanup subscription on unmount
    return () => {
      console.log('Removendo subscription realtime...');
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return {
    clients,
    setClients,
    loading,
    fetchClients
  };
};
