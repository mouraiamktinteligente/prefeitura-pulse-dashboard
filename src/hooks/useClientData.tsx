import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

interface ClientData {
  id: string;
  nome_completo: string;
  instagram_prefeitura: string | null;
  instagram_prefeito: string | null;
}

export const useClientData = () => {
  const { user } = useAuth();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Buscar o usuário no sistema para pegar o cliente_id
        const { data: userData, error: userError } = await supabase
          .from('usuarios_sistema')
          .select('cliente_id')
          .eq('email', user.email)
          .single();

        if (userError) throw userError;

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

  return { clientData, loading };
};
