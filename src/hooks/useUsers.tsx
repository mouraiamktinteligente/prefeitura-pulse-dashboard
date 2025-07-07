
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import { useAuth } from '@/hooks/useAuth';
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
  }, []);

  return {
    users,
    loading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
};
