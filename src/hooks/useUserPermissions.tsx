
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { UsuarioSistema } from "./useUsers";

interface UserPermissions {
  userSystem: UsuarioSistema | null;
  isAdmin: boolean;
  isUser: boolean;
  isClient: boolean;
  loading: boolean;
}

export const useUserPermissions = (): UserPermissions => {
  const { user } = useAuth();
  const [userSystem, setUserSystem] = useState<UsuarioSistema | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserSystem = async () => {
      if (!user?.email) {
        setUserSystem(null);
        setLoading(false);
        return;
      }

      try {
        console.log('Buscando dados do usuário do sistema para:', user.email);
        
        // Aguardar um pouco para garantir que o JWT seja processado
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Usar select simples sem maybeSingle
        const { data, error } = await supabase
          .from('usuarios_sistema')
          .select('*')
          .eq('email', user.email)
          .eq('ativo', true);

        if (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          setUserSystem(null);
        } else if (data && data.length > 0) {
          console.log('Dados do usuário encontrados:', data[0]);
          setUserSystem(data[0]);
        } else {
          console.log('Nenhum dado encontrado para o usuário');
          setUserSystem(null);
        }
      } catch (error) {
        console.error('Erro ao buscar usuário do sistema:', error);
        setUserSystem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSystem();
  }, [user?.email]);

  return {
    userSystem,
    isAdmin: userSystem?.tipo_usuario === 'administrador',
    isUser: userSystem?.tipo_usuario === 'usuario',
    isClient: userSystem?.tipo_usuario === 'cliente',
    loading
  };
};
