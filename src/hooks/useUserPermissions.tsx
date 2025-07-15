
import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/auth";
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
    if (!user) {
      console.log('useUserPermissions: Nenhum usuário logado');
      setUserSystem(null);
      setLoading(false);
      return;
    }

    // Usar os dados do usuário autenticado
    const userData: UsuarioSistema = {
      id: user.id,
      tipo_usuario: user.tipo_usuario,
      tipo_pessoa: 'fisica',
      nome_completo: user.nome_completo,
      cpf_cnpj: '00000000000',
      email: user.email,
      ativo: true,
      permissoes: user.permissoes || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('useUserPermissions: Dados do usuário:', userData);
    setUserSystem(userData);
    setLoading(false);
  }, [user]);

  const isAdmin = userSystem?.tipo_usuario === 'administrador' || 
                  (userSystem?.permissoes && typeof userSystem.permissoes === 'object' && userSystem.permissoes.Full === true);

  return {
    userSystem,
    isAdmin,
    isUser: userSystem?.tipo_usuario === 'usuario',
    isClient: userSystem?.tipo_usuario === 'cliente',
    loading
  };
};
