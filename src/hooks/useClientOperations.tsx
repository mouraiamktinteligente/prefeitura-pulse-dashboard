
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import { useAuth } from '@/hooks/useAuth';
import type { Cliente, ClienteInsert, ClienteUpdate } from './useClients';

export const useClientOperations = () => {
  const { toast } = useToast();
  const { registrarMovimentacao } = useMovimentacoes();
  const { user } = useAuth();

  const createClient = async (clientData: ClienteInsert) => {
    try {
      console.log('Criando cliente:', clientData);
      const { data, error } = await supabase
        .from('cadastro_clientes')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar cliente:', error);
        toast({
          title: "Erro ao cadastrar cliente",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      console.log('Cliente criado:', data);
      
      // Registrar movimentação
      await registrarMovimentacao(
        `Cliente cadastrado: ${data.nome_completo}`,
        'cadastro_clientes',
        null,
        data,
        user?.email
      );
      
      toast({
        title: "Cliente cadastrado",
        description: "Cliente cadastrado com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Erro inesperado ao criar cliente:', error);
      throw error;
    }
  };

  const updateClient = async (id: string, clientData: ClienteUpdate) => {
    try {
      console.log('Atualizando cliente:', id, clientData);
      
      // Buscar dados anteriores antes da atualização
      const { data: dadosAnteriores } = await supabase
        .from('cadastro_clientes')
        .select('*')
        .eq('id', id)
        .single();
      
      const { data, error } = await supabase
        .from('cadastro_clientes')
        .update(clientData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar cliente:', error);
        toast({
          title: "Erro ao atualizar cliente",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      console.log('Cliente atualizado:', data);
      
      // Registrar movimentação
      await registrarMovimentacao(
        `Cliente atualizado: ${data.nome_completo}`,
        'cadastro_clientes',
        dadosAnteriores,
        data,
        user?.email
      );
      
      toast({
        title: "Cliente atualizado",
        description: "Dados do cliente atualizados com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Erro inesperado ao atualizar cliente:', error);
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      console.log('Excluindo cliente:', id);
      
      // Buscar dados antes da exclusão
      const { data: dadosAnteriores } = await supabase
        .from('cadastro_clientes')
        .select('*')
        .eq('id', id)
        .single();
      
      const { error } = await supabase
        .from('cadastro_clientes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir cliente:', error);
        toast({
          title: "Erro ao excluir cliente",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      console.log('Cliente excluído com sucesso');
      
      // Registrar movimentação
      await registrarMovimentacao(
        `Cliente excluído: ${dadosAnteriores?.nome_completo || 'Cliente não encontrado'}`,
        'cadastro_clientes',
        dadosAnteriores,
        null,
        user?.email
      );
      
      toast({
        title: "Cliente excluído",
        description: "Cliente removido com sucesso!"
      });
    } catch (error) {
      console.error('Erro inesperado ao excluir cliente:', error);
      throw error;
    }
  };

  return {
    createClient,
    updateClient,
    deleteClient
  };
};
