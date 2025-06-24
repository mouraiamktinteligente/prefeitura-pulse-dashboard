
import { useState, useEffect } from 'react';
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
    if (!user) {
      console.log('useUserPermissions: Nenhum usuário logado');
      setUserSystem(null);
      setLoading(false);
      return;
    }

    // Como o login já verificou a tabela usuarios_sistema, podemos usar os dados do usuário
    const userData: UsuarioSistema = {
      id: user.id,
      tipo_usuario: user.user_metadata.tipo_usuario,
      tipo_pessoa: 'fisica', // valor padrão
      nome_completo: user.user_metadata.nome_completo,
      cpf_cnpj: '00000000000', // valor padrão
      email: user.email,
      ativo: true,
      permissoes: user.user_metadata.permissoes || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('useUserPermissions: Dados do usuário:', userData);
    setUserSystem(userData);
    setLoading(false);
  }, [user]);

  // Verificar se tem permissão "Full" para ser administrador
  const isAdmin = userSystem?.tipo_usuario === 'administrador' || userSystem?.permissoes?.Full === true;

  return {
    userSystem,
    isAdmin,
    isUser: userSystem?.tipo_usuario === 'usuario',
    isClient: userSystem?.tipo_usuario === 'cliente',
    loading
  };
};
