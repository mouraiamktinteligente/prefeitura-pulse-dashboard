
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

export type Cliente = Database['public']['Tables']['cadastro_clientes']['Row'];
export type ClienteInsert = Database['public']['Tables']['cadastro_clientes']['Insert'];
export type ClienteUpdate = Database['public']['Tables']['cadastro_clientes']['Update'];

export const useClients = () => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchClients = async () => {
    try {
      console.log('=== INÍCIO DA BUSCA DE CLIENTES ===');
      console.log('Buscando clientes...');
      
      // Verificar se o usuário está autenticado no sistema customizado
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
      console.log('Dados completos do usuário:', JSON.stringify(user, null, 2));

      // Verificar se a sessão do Supabase existe
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Sessão do Supabase:', session ? 'Existe' : 'Não existe');
      if (sessionError) {
        console.error('Erro ao obter sessão:', sessionError);
      }

      // Tentar consulta simples primeiro
      console.log('Fazendo consulta na tabela cadastro_clientes...');
      const { data, error, count } = await supabase
        .from('cadastro_clientes')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      console.log('Resultado da consulta:');
      console.log('- Error:', error);
      console.log('- Data:', data);
      console.log('- Count:', count);
      console.log('- Tipo do data:', typeof data);
      console.log('- É array?', Array.isArray(data));

      if (error) {
        console.error('Erro detalhado ao buscar clientes:', error);
        console.error('Código do erro:', error.code);
        console.error('Mensagem:', error.message);
        console.error('Detalhes:', error.details);
        console.error('Hint:', error.hint);
        
        // Verificar se é problema de RLS
        if (error.code === 'PGRST116' || error.message.includes('RLS') || error.message.includes('policy')) {
          console.error('PROBLEMA DE RLS DETECTADO!');
          console.error('As políticas de Row Level Security estão bloqueando o acesso');
        }
        
        toast({
          title: "Erro ao carregar clientes",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Clientes encontrados:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('Primeiro cliente:', JSON.stringify(data[0], null, 2));
        console.log('Todos os clientes:', JSON.stringify(data, null, 2));
      } else {
        console.log('Nenhum cliente encontrado na consulta');
      }
      
      setClients(data || []);
      console.log('=== FIM DA BUSCA DE CLIENTES ===');
    } catch (error) {
      console.error('Erro inesperado na busca:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
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
    // Só buscar clientes se o usuário estiver autenticado
    if (user) {
      console.log('useEffect: Usuário autenticado, buscando clientes...');
      fetchClients();
    } else {
      console.log('useEffect: Usuário não autenticado, definindo loading como false');
      setLoading(false);
    }
  }, [user]);

  return {
    clients,
    loading,
    createClient,
    updateClient,
    deleteClient,
    refetch: fetchClients
  };
};
