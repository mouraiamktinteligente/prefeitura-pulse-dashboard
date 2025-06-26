
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Cliente, ClienteInsert, ClienteUpdate } from './useClients';

export const useClientOperations = () => {
  const { toast } = useToast();

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
