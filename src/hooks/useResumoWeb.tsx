import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ResumoWeb {
  id: number;
  prefeitura: string | null;
  cidade: string;
  resumo: string | null;
  tema: string | null;
  created_at: string;
  data_formatada: string;
}

interface WebPorCidade {
  cidade: string;
  alertas: ResumoWeb[];
}

export const useResumoWeb = (dataSelecionada?: Date, prefeituraFiltro?: string) => {
  const [webPorCidade, setWebPorCidade] = useState<WebPorCidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  const formatarData = (dataISO: string): string => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const agruparPorCidade = (dados: ResumoWeb[]): WebPorCidade[] => {
    const grupos: { [key: string]: ResumoWeb[] } = {};

    dados.forEach(item => {
      if (!grupos[item.cidade]) {
        grupos[item.cidade] = [];
      }
      grupos[item.cidade].push(item);
    });

    return Object.entries(grupos)
      .map(([cidade, alertas]) => ({ cidade, alertas }))
      .sort((a, b) => a.cidade.localeCompare(b.cidade));
  };

  useEffect(() => {
    const fetchResumoWeb = async () => {
      try {
        setIsLoading(true);
        
        const dataFiltro = dataSelecionada || new Date();
        const ano = dataFiltro.getFullYear();
        const mes = dataFiltro.getMonth();
        const dia = dataFiltro.getDate();
        
        const inicioDia = new Date(Date.UTC(ano, mes, dia, 0, 0, 0, 0));
        const fimDia = new Date(Date.UTC(ano, mes, dia, 23, 59, 59, 999));
        
        console.log('🔍 [Web] Buscando dados entre:', inicioDia.toISOString(), 'e', fimDia.toISOString());
        
        let query = supabase
          .from('resumo_web')
          .select('*')
          .gte('created_at', inicioDia.toISOString())
          .lte('created_at', fimDia.toISOString());
        
        if (prefeituraFiltro) {
          query = query.eq('instagram_prefeitura', prefeituraFiltro);
          console.log('🔎 [Web] Filtro aplicado (instagram_prefeitura):', prefeituraFiltro);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar resumos Web:', error);
          return;
        }

        console.log('✅ [Web] Registros retornados:', data?.length || 0);
        if (prefeituraFiltro) {
          console.log('🔎 [Web] Filtro de prefeitura aplicado:', prefeituraFiltro);
        }

        const dadosProcessados = (data || []).map(item => ({
          ...item,
          cidade: item.prefeitura || 'Sem Prefeitura',
          data_formatada: formatarData(item.created_at)
        }));

        const dadosAgrupados = agruparPorCidade(dadosProcessados);
        setWebPorCidade(dadosAgrupados);
      } catch (error) {
        console.error('Erro inesperado ao buscar resumos Web:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumoWeb();
  }, [dataSelecionada, prefeituraFiltro]);

  return { webPorCidade, isLoading };
};
