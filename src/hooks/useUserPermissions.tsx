
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
        console.log('useUserPermissions: Nenhum usuário logado');
        setUserSystem(null);
        setLoading(false);
        return;
      }

      try {
        console.log('useUserPermissions: Buscando dados do usuário para:', user.email);
        
        // Aguardar um pouco para garantir que as políticas RLS estejam ativas
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data, error } = await supabase
          .from('usuarios_sistema')
          .select('*')
          .eq('email', user.email)
          .eq('ativo', true)
          .maybeSingle();

        console.log('useUserPermissions: Resultado da consulta:', { data, error });

        if (error) {
          console.error('useUserPermissions: Erro ao buscar dados do usuário:', error);
          // Se houver erro RLS, vamos tentar criar o usuário admin automaticamente
          if (user.email === 'admin@sistema.com' && error.message.includes('RLS')) {
            console.log('useUserPermissions: Tentando criar usuário admin automaticamente...');
            try {
              const { data: insertData, error: insertError } = await supabase
                .from('usuarios_sistema')
                .insert({
                  tipo_usuario: 'administrador',
                  tipo_pessoa: 'fisica',
                  nome_completo: 'Administrador do Sistema',
                  cpf_cnpj: '00000000000',
                  email: 'admin@sistema.com',
                  ativo: true
                })
                .select()
                .maybeSingle();

              if (insertError) {
                console.error('useUserPermissions: Erro ao criar admin:', insertError);
                setUserSystem(null);
              } else {
                console.log('useUserPermissions: Admin criado com sucesso:', insertData);
                setUserSystem(insertData);
              }
            } catch (createError) {
              console.error('useUserPermissions: Erro ao criar admin:', createError);
              setUserSystem(null);
            }
          } else {
            setUserSystem(null);
          }
        } else if (data) {
          console.log('useUserPermissions: Dados do usuário encontrados:', data);
          setUserSystem(data);
        } else {
          console.log('useUserPermissions: Nenhum dado encontrado para o usuário');
          // Se for o admin e não encontrou dados, vamos criar
          if (user.email === 'admin@sistema.com') {
            console.log('useUserPermissions: Criando usuário admin...');
            try {
              const { data: insertData, error: insertError } = await supabase
                .from('usuarios_sistema')
                .insert({
                  tipo_usuario: 'administrador',
                  tipo_pessoa: 'fisica',
                  nome_completo: 'Administrador do Sistema',
                  cpf_cnpj: '00000000000',
                  email: 'admin@sistema.com',
                  ativo: true
                })
                .select()
                .maybeSingle();

              if (insertError) {
                console.error('useUserPermissions: Erro ao criar admin:', insertError);
                setUserSystem(null);
              } else {
                console.log('useUserPermissions: Admin criado com sucesso:', insertData);
                setUserSystem(insertData);
              }
            } catch (createError) {
              console.error('useUserPermissions: Erro ao criar admin:', createError);
              setUserSystem(null);
            }
          } else {
            setUserSystem(null);
          }
        }
      } catch (error) {
        console.error('useUserPermissions: Erro inesperado:', error);
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
