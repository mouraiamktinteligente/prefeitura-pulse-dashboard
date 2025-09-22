import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';

export const useMonitoredLinks = () => {
  const { toast } = useToast();

  const getMonitoredLinks = useCallback(async (profilePrefeitura: string) => {
    try {
      const { data, error } = await supabase
        .from('linkweb_monitoramento_cliente' as any)
        .select('*')
        .eq('profile_prefeitura', profilePrefeitura)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar links monitorados:', error);
        return [];
      }

      return data?.map((item: any) => item.link) || [];
    } catch (error) {
      console.error('Erro inesperado ao buscar links:', error);
      return [];
    }
  }, []);

  const saveMonitoredLinks = useCallback(async (links: string[], profilePrefeitura: string) => {
    try {
      // Primeiro, deletar todos os links existentes para este perfil
      const { error: deleteError } = await supabase
        .from('linkweb_monitoramento_cliente' as any)
        .delete()
        .eq('profile_prefeitura', profilePrefeitura);

      if (deleteError) {
        console.error('Erro ao deletar links existentes:', deleteError);
        throw deleteError;
      }

      // Se não há links para salvar, retornar sucesso
      if (links.length === 0) {
        return true;
      }

      // Preparar dados para inserção
      const linksToInsert = links.map(link => ({
        link: link,
        profile_prefeitura: profilePrefeitura,
        created_at: new Date().toISOString()
      }));

      // Inserir novos links
      const { error: insertError } = await supabase
        .from('linkweb_monitoramento_cliente' as any)
        .insert(linksToInsert);

      if (insertError) {
        console.error('Erro ao salvar novos links:', insertError);
        throw insertError;
      }

      console.log(`${links.length} links salvos para o perfil ${profilePrefeitura}`);
      return true;
    } catch (error) {
      console.error('Erro inesperado ao salvar links:', error);
      throw error;
    }
  }, []);

  const deleteAllMonitoredLinks = useCallback(async (profilePrefeitura: string) => {
    try {
      const { error } = await supabase
        .from('linkweb_monitoramento_cliente' as any)
        .delete()
        .eq('profile_prefeitura', profilePrefeitura);

      if (error) {
        console.error('Erro ao deletar links monitorados:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao deletar links:', error);
      throw error;
    }
  }, []);

  return {
    getMonitoredLinks,
    saveMonitoredLinks,
    deleteAllMonitoredLinks
  };
};