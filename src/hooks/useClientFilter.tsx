import { useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { useClients } from './useClients';

interface ClientFilterResult {
  allowedProfiles: string[];
  allowedClientIds: string[];
  clientData: any | null;
  hasAccessToAllClients: boolean;
  clientId: string | null;
  isLoading: boolean;
}

export const useClientFilter = (): ClientFilterResult => {
  const { user } = useAuth();
  const { clients, loading } = useClients();
  
  const result = useMemo(() => {
    if (!user) {
      return {
        allowedProfiles: [],
        allowedClientIds: [],
        clientData: null,
        hasAccessToAllClients: false,
        clientId: null,
        isLoading: loading
      };
    }
    
    // Administrador com acesso geral (cliente_id = null)
    const hasAccessToAll = user.tipo_usuario === 'administrador' && !user.cliente_id;
    
    if (hasAccessToAll) {
      return {
        allowedProfiles: clients.flatMap(c => [
          c.instagram_prefeitura,
          c.instagram_prefeito
        ].filter(Boolean)),
        allowedClientIds: clients.map(c => c.id),
        clientData: null,
        hasAccessToAllClients: true,
        clientId: null,
        isLoading: loading
      };
    }
    
    // Usuário com prefeitura específica
    if (user.cliente_id) {
      const clientData = clients.find(c => c.id === user.cliente_id);
      
      if (clientData) {
        return {
          allowedProfiles: [
            clientData.instagram_prefeitura,
            clientData.instagram_prefeito
          ].filter(Boolean),
          allowedClientIds: [clientData.id],
          clientData,
          hasAccessToAllClients: false,
          clientId: user.cliente_id,
          isLoading: loading
        };
      }
    }
    
    return {
      allowedProfiles: [],
      allowedClientIds: [],
      clientData: null,
      hasAccessToAllClients: false,
      clientId: null,
      isLoading: loading
    };
  }, [user, clients, loading]);
  
  return result;
};
