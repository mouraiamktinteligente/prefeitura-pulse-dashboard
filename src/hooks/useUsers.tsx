
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  const createUser = async (userData: Partial<UsuarioSistema>) => {
    try {
      const { data, error } = await supabase
        .from('usuarios_sistema')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      
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

  const updateUser = async (id: string, userData: Partial<UsuarioSistema>) => {
    try {
      const { data, error } = await supabase
        .from('usuarios_sistema')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
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
      const { error } = await supabase
        .from('usuarios_sistema')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
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
