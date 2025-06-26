
import { useState } from 'react';
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

  return {
    clients,
    setClients,
    loading,
    fetchClients
  };
};
