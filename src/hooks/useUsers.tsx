
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import { useAuth } from '@/contexts/auth';
import type { Database } from "@/integrations/supabase/types";

// Tipo para inserção que corresponde ao schema do Supabase
type UsuarioInsert = Database['public']['Tables']['usuarios_sistema']['Insert'];

// Tipo para os dados do usuário retornados pelo Supabase
export interface UsuarioSistema {
  id: string;
  tipo_usuario: 'administrador' | 'usuario' | 'cliente';
  tipo_pessoa: 'fisica' | 'juridica';
  nome_completo: string;
  razao_social?: string;
  nome_responsavel?: string;
  cpf_cnpj: string;
  email?: string;
  whatsapp?: string;
  endereco_cep?: string;
  endereco_rua?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  permissoes?: any;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<UsuarioSistema[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { registrarMovimentacao } = useMovimentacoes();
  const { user } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('usuarios_sistema')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: UsuarioInsert) => {
    try {
      const { data, error } = await supabase
        .from('usuarios_sistema')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;
      
      // Registrar movimentação
      await registrarMovimentacao(
        `Usuário cadastrado: ${data.nome_completo} (${data.email})`,
        'usuarios_sistema',
        null,
        data,
        user?.email
      );
      
      toast({
        title: "Sucesso",
        description: "Usuário cadastrado com sucesso!"
      });
      
      await fetchUsers();
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar usuário",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<UsuarioInsert>) => {
    try {
      // Buscar dados anteriores antes da atualização
      const { data: dadosAnteriores } = await supabase
        .from('usuarios_sistema')
        .select('*')
        .eq('id', id)
        .single();
      
      const { data, error } = await supabase
        .from('usuarios_sistema')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Registrar movimentação
      await registrarMovimentacao(
        `Usuário atualizado: ${data.nome_completo} (${data.email})`,
        'usuarios_sistema',
        dadosAnteriores,
        data,
        user?.email
      );
      
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!"
      });
      
      await fetchUsers();
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      // Buscar dados antes da exclusão
      const { data: dadosAnteriores } = await supabase
        .from('usuarios_sistema')
        .select('*')
        .eq('id', id)
        .single();
      
      const { error } = await supabase
        .from('usuarios_sistema')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Registrar movimentação
      await registrarMovimentacao(
        `Usuário excluído: ${dadosAnteriores?.nome_completo || 'Usuário não encontrado'} (${dadosAnteriores?.email})`,
        'usuarios_sistema',
        dadosAnteriores,
        null,
        user?.email
      );
      
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!"
      });
      
      await fetchUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchUsers();

    let debounceTimeout: NodeJS.Timeout;
    let isProcessing = false;

    // Setup realtime listener para usuarios_sistema
    let channel: any = null;

    const setupRealtimeListener = async () => {
      try {
        channel = supabase
          .channel('usuarios-sistema-changes')
          .on(
            'postgres_changes',
            {
              event: '*', // escutar INSERT, UPDATE, DELETE
              schema: 'public',
              table: 'usuarios_sistema'
            },
            (payload) => {
              console.log('Usuarios realtime event:', payload);
              
              // Evitar processamento concorrente
              if (isProcessing) {
                console.log('Já processando atualização, ignorando...');
                return;
              }

              // Filtrar atualizações automáticas que não são relevantes
              if (payload.eventType === 'UPDATE' && payload.old && payload.new) {
                const oldData = payload.old as any;
                const newData = payload.new as any;
                
                // Lista de campos que, se apenas eles mudaram, devemos ignorar
                const ignoredFields = ['status_conexao', 'updated_at'];
                
                const changedFields = Object.keys(newData).filter(key => 
                  oldData[key] !== newData[key]
                );
                
                const relevantChanges = changedFields.filter(field => 
                  !ignoredFields.includes(field)
                );

                // Se apenas campos ignorados mudaram, não processar
                if (relevantChanges.length === 0) {
                  console.log('Ignorando atualização automática de campos:', changedFields);
                  return;
                }

                // Se é atualização do próprio usuário que está fazendo a operação, não mostrar toast
                if (user?.email === newData.email) {
                  console.log('Ignorando atualização do próprio usuário');
                  // Ainda recarregar a lista sem toast
                  clearTimeout(debounceTimeout);
                  debounceTimeout = setTimeout(() => {
                    if (!isProcessing) {
                      isProcessing = true;
                      fetchUsers().finally(() => {
                        isProcessing = false;
                      });
                    }
                  }, 1000);
                  return;
                }
              }
              
              // Debounce para evitar múltiplas atualizações seguidas
              clearTimeout(debounceTimeout);
              debounceTimeout = setTimeout(() => {
                if (isProcessing) return;
                
                isProcessing = true;

                // Mostrar toast apenas para mudanças relevantes de outros usuários
                if (payload.eventType === 'INSERT') {
                  toast({
                    title: "Novo usuário",
                    description: `Usuário "${payload.new.nome_completo}" foi criado por outro usuário`,
                  });
                } else if (payload.eventType === 'UPDATE') {
                  toast({
                    title: "Usuário atualizado", 
                    description: `Usuário "${payload.new.nome_completo}" foi atualizado por outro usuário`,
                  });
                } else if (payload.eventType === 'DELETE') {
                  toast({
                    title: "Usuário removido",
                    description: "Um usuário foi removido por outro usuário",
                    variant: "destructive"
                  });
                }
                
                // Recarregar lista para refletir mudanças
                fetchUsers().finally(() => {
                  isProcessing = false;
                });
              }, 1000);
            }
          );

        await channel.subscribe();
        console.log('Listener de usuários configurado com sucesso');
      } catch (error) {
        console.warn('Erro ao configurar listener de usuários:', error);
        // Continue without realtime - the app should work without it
      }
    };

    setupRealtimeListener();

    return () => {
      clearTimeout(debounceTimeout);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.warn('Erro ao remover canal de usuários:', error);
        }
      }
    };
  }, [user?.email]);

  return {
    users,
    loading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
};
