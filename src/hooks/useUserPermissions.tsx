
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
        console.log('Nenhum usuário logado');
        setUserSystem(null);
        setLoading(false);
        return;
      }

      try {
        console.log('Buscando dados do usuário do sistema para:', user.email);
        
        // Aguardar um pouco para garantir que as políticas RLS estejam ativas
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data, error } = await supabase
          .from('usuarios_sistema')
          .select('*')
          .eq('email', user.email)
          .eq('ativo', true)
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar dados do usuário:', error.message);
          setUserSystem(null);
        } else if (data) {
          console.log('Dados do usuário encontrados:', data);
          setUserSystem(data);
        } else {
          console.log('Nenhum dado encontrado para o usuário');
          setUserSystem(null);
        }
      } catch (error) {
        console.error('Erro inesperado ao buscar usuário do sistema:', error);
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
