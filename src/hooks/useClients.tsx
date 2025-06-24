
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

export type Cliente = Database['public']['Tables']['cadastro_clientes']['Row'];
export type ClienteInsert = Database['public']['Tables']['cadastro_clientes']['Insert'];
export type ClienteUpdate = Database['public']['Tables']['cadastro_clientes']['Update'];

export const useClients = () => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      console.log('Buscando clientes...');
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

      console.log('Clientes carregados:', data?.length || 0);
      setClients(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao carregar dados dos clientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: ClienteInsert) => {
    try {
      console.log('Criando cliente:', clientData);
      const { data, error } = await supabase
        .from('cadastro_clientes')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar cliente:', error);
        toast({
          title: "Erro ao cadastrar cliente",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      console.log('Cliente criado:', data);
      setClients(prev => [data, ...prev]);
      toast({
        title: "Cliente cadastrado",
        description: "Cliente cadastrado com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Erro inesperado ao criar cliente:', error);
      throw error;
    }
  };

  const updateClient = async (id: string, clientData: ClienteUpdate) => {
    try {
      console.log('Atualizando cliente:', id, clientData);
      const { data, error } = await supabase
        .from('cadastro_clientes')
        .update(clientData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar cliente:', error);
        toast({
          title: "Erro ao atualizar cliente",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      console.log('Cliente atualizado:', data);
      setClients(prev => prev.map(client => client.id === id ? data : client));
      toast({
        title: "Cliente atualizado",
        description: "Dados do cliente atualizados com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Erro inesperado ao atualizar cliente:', error);
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      console.log('Excluindo cliente:', id);
      const { error } = await supabase
        .from('cadastro_clientes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir cliente:', error);
        toast({
          title: "Erro ao excluir cliente",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      console.log('Cliente excluído com sucesso');
      setClients(prev => prev.filter(client => client.id !== id));
      toast({
        title: "Cliente excluído",
        description: "Cliente removido com sucesso!"
      });
    } catch (error) {
      console.error('Erro inesperado ao excluir cliente:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    createClient,
    updateClient,
    deleteClient,
    refetch: fetchClients
  };
};
