import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

interface ClientData {
  id: string;
  nome_completo: string;
  instagram_prefeitura: string | null;
  instagram_prefeito: string | null;
}

interface UseClientDataReturn {
  clientData: ClientData | null;
  loading: boolean;
  isAdminMaster: boolean;
}

export const useClientData = (): UseClientDataReturn => {
  const { user } = useAuth();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminMaster, setIsAdminMaster] = useState(false);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Buscar o usuário no sistema para pegar o cliente_id e tipo_usuario
        const { data: userData, error: userError } = await supabase
          .from('usuarios_sistema')
          .select('cliente_id, tipo_usuario')
          .eq('email', user.email)
          .single();

        if (userError) throw userError;

        // Detectar se é admin master (administrador sem cliente_id)
        if (userData.tipo_usuario === 'administrador' && !userData.cliente_id) {
          setIsAdminMaster(true);
          setClientData(null);
          setLoading(false);
          return;
        }

        // Se o usuário tem cliente_id, buscar os dados do cliente
        if (userData?.cliente_id) {
          const { data: cliente, error: clientError } = await supabase
            .from('cadastro_clientes')
            .select('id, nome_completo, instagram_prefeitura, instagram_prefeito')
            .eq('id', userData.cliente_id)
            .single();

          if (clientError) throw clientError;
          setClientData(cliente);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do cliente:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [user]);

  return { clientData, loading, isAdminMaster };
};
