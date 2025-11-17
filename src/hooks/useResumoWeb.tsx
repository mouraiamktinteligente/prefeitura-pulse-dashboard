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

  const extrairNomeCidade = (prefeitura: string): string => {
    if (!prefeitura) return 'Sem Cidade';
    
    const prefeituraLower = prefeitura.toLowerCase();
    if (prefeituraLower.includes('prefeitura') || prefeituraLower.includes('municipal')) {
      const match = prefeitura.match(/(?:prefeitura|municipal)\s+(?:de|do|da)?\s*(.+)/i);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return prefeitura;
  };

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
        const inicioDia = new Date(dataFiltro);
        inicioDia.setHours(0, 0, 0, 0);
        const fimDia = new Date(dataFiltro);
        fimDia.setHours(23, 59, 59, 999);
        
        let query = supabase
          .from('resumo_web')
          .select('*')
          .gte('created_at', inicioDia.toISOString())
          .lte('created_at', fimDia.toISOString());
        
        if (prefeituraFiltro) {
          const nomeCidadeTratado = extrairNomeCidade(prefeituraFiltro);
          query = query.or(`prefeitura.ilike.%${nomeCidadeTratado}%,prefeitura.ilike.%${prefeituraFiltro}%`);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar resumos Web:', error);
          return;
        }

        const dadosProcessados = (data || []).map(item => ({
          ...item,
          cidade: extrairNomeCidade(item.prefeitura || ''),
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
