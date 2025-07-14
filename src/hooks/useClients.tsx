
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClientsFetch } from './useClientsFetch';
import { useClientOperations } from './useClientOperations';
import type { Database } from '@/integrations/supabase/types';

export type Cliente = Database['public']['Tables']['cadastro_clientes']['Row'];
export type ClienteInsert = Database['public']['Tables']['cadastro_clientes']['Insert'];
export type ClienteUpdate = Database['public']['Tables']['cadastro_clientes']['Update'];

export const useClients = () => {
  const { user } = useAuth();
  const { clients, setClients, loading, fetchClients, initialized } = useClientsFetch();
  const { createClient: createClientOp, updateClient: updateClientOp, deleteClient: deleteClientOp } = useClientOperations();
  const hasCalledRef = useRef(false);

  const createClient = async (clientData: ClienteInsert) => {
    const data = await createClientOp(clientData);
    setClients(prev => [data, ...prev]);
    return data;
  };

  const updateClient = async (id: string, clientData: ClienteUpdate) => {
    const data = await updateClientOp(id, clientData);
    setClients(prev => prev.map(client => client.id === id ? data : client));
    return data;
  };

  const deleteClient = async (id: string) => {
    await deleteClientOp(id);
    setClients(prev => prev.filter(client => client.id !== id));
  };

  useEffect(() => {
    if (user && !hasCalledRef.current && !initialized) {
      console.log('useEffect: Usuário autenticado, buscando clientes...');
      hasCalledRef.current = true;
      fetchClients();
    } else if (!user) {
      console.log('useEffect: Usuário não autenticado');
      hasCalledRef.current = false;
    }
  }, [user, initialized, fetchClients]);

  return {
    clients,
    loading,
    createClient,
    updateClient,
    deleteClient,
    refetch: fetchClients
  };
};
