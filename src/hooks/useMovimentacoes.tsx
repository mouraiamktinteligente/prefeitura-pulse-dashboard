import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RegistroMovimentacao {
  id: string;
  email_usuario: string;
  data_hora_acao: string;
  acao_realizada: string;
  tabela_afetada?: string;
  dados_anteriores?: any;
  dados_novos?: any;
  ip_address?: string;
  created_at: string;
  updated_at: string;
}

export const useMovimentacoes = () => {
  const [movimentacoes, setMovimentacoes] = useState<RegistroMovimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const buscarMovimentacoes = useCallback(async (
    searchTerm?: string,
    dateFrom?: Date,
    dateTo?: Date
  ) => {
    try {
      setLoading(true);
      console.log('Buscando movimentações com filtros:', { searchTerm, dateFrom, dateTo });

      let query = supabase
        .from('registro_movimentacoes')
        .select('*')
        .order('data_hora_acao', { ascending: false });

      // Filtro por palavra-chave
      if (searchTerm && searchTerm.trim()) {
        query = query.ilike('acao_realizada', `%${searchTerm.trim()}%`);
      }

      // Filtro por data inicial
      if (dateFrom) {
        const startOfDay = new Date(dateFrom);
        startOfDay.setHours(0, 0, 0, 0);
        query = query.gte('data_hora_acao', startOfDay.toISOString());
      }

      // Filtro por data final
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('data_hora_acao', endOfDay.toISOString());
      }

      const { data, error } = await query.limit(1000);

      if (error) {
        console.error('Erro ao buscar movimentações:', error);
        toast({
          title: "Erro ao carregar movimentações",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Movimentações encontradas:', data?.length || 0);
      setMovimentacoes(data || []);
    } catch (error) {
      console.error('Erro inesperado ao buscar movimentações:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao carregar movimentações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const filtrarMovimentacoes = useCallback((
    searchTerm?: string,
    dateFrom?: Date,
    dateTo?: Date
  ) => {
    buscarMovimentacoes(searchTerm, dateFrom, dateTo);
  }, [buscarMovimentacoes]);

  const exportarMovimentacoes = useCallback(async (
    searchTerm?: string,
    dateFrom?: Date,
    dateTo?: Date
  ) => {
    try {
      let query = supabase
        .from('registro_movimentacoes')
        .select('*')
        .order('data_hora_acao', { ascending: false });

      // Aplicar os mesmos filtros
      if (searchTerm && searchTerm.trim()) {
        query = query.ilike('acao_realizada', `%${searchTerm.trim()}%`);
      }

      if (dateFrom) {
        const startOfDay = new Date(dateFrom);
        startOfDay.setHours(0, 0, 0, 0);
        query = query.gte('data_hora_acao', startOfDay.toISOString());
      }

      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('data_hora_acao', endOfDay.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Criar CSV
      const headers = ['Data/Hora', 'Usuário', 'Ação Realizada', 'Tabela', 'IP'];
      const csvContent = [
        headers.join(','),
        ...(data || []).map(row => [
          new Date(row.data_hora_acao).toLocaleString('pt-BR'),
          row.email_usuario,
          `"${row.acao_realizada.replace(/"/g, '""')}"`,
          row.tabela_afetada || '',
          row.ip_address || ''
        ].join(','))
      ].join('\n');

      // Download do arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `movimentacoes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao exportar movimentações:', error);
      throw error;
    }
  }, []);

  const registrarMovimentacao = useCallback(async (
    acao: string,
    tabela?: string,
    dadosAnteriores?: any,
    dadosNovos?: any,
    emailUsuario?: string
  ) => {
    try {
      // Obter IP do usuário (simplificado)
      let userIP = null;
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        userIP = data.ip;
      } catch (ipError) {
        console.warn('Não foi possível obter o IP:', ipError);
      }

      const { error } = await supabase
        .from('registro_movimentacoes')
        .insert({
          email_usuario: emailUsuario || 'sistema@unknown.com',
          acao_realizada: acao,
          tabela_afetada: tabela,
          dados_anteriores: dadosAnteriores,
          dados_novos: dadosNovos,
          ip_address: userIP
        });

      if (error) {
        console.error('Erro ao registrar movimentação:', error);
      }
    } catch (error) {
      console.error('Erro inesperado ao registrar movimentação:', error);
    }
  }, []);

  // Carregar movimentações iniciais
  useEffect(() => {
    buscarMovimentacoes();
  }, [buscarMovimentacoes]);

  // Real-time listener para novas movimentações
  useEffect(() => {
    const channel = supabase
      .channel('movimentacoes-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'registro_movimentacoes'
        },
        (payload) => {
          console.log('📋 Nova movimentação registrada:', payload);
          // Recarregar a lista
          buscarMovimentacoes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buscarMovimentacoes]);

  return {
    movimentacoes,
    loading,
    filtrarMovimentacoes,
    exportarMovimentacoes,
    registrarMovimentacao
  };
};