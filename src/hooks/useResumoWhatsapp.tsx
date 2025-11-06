import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ResumoWhatsapp {
  id: number;
  grupo: string;
  prefeitura: string;
  cidade: string;
  resumo: string;
  tema: string | null;
  created_at: string;
  data_formatada: string;
}

interface WhatsappPorCidade {
  cidade: string;
  grupos: ResumoWhatsapp[];
}

export const useResumoWhatsapp = (dataSelecionada?: Date, prefeituraFiltro?: string) => {
  const [whatsappPorCidade, setWhatsappPorCidade] = useState<WhatsappPorCidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const extrairNomeCidade = (prefeitura: string): string => {
    return prefeitura
      .replace(/^Prefeitura Municipal de /i, '')
      .replace(/^Prefeitura de /i, '')
      .trim();
  };

  const formatarData = (dataISO: string): string => {
    const data = new Date(dataISO);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const agruparPorCidade = (dados: ResumoWhatsapp[]): WhatsappPorCidade[] => {
    const grupos = dados.reduce((acc, item) => {
      const cidade = item.cidade;
      if (!acc[cidade]) {
        acc[cidade] = [];
      }
      acc[cidade].push(item);
      return acc;
    }, {} as Record<string, ResumoWhatsapp[]>);

    return Object.entries(grupos).map(([cidade, grupos]) => ({
      cidade,
      grupos
    }));
  };

  useEffect(() => {
    const fetchResumoWhatsapp = async () => {
      try {
        setIsLoading(true);
        
        // Obter data atual ou data selecionada
        const dataFiltro = dataSelecionada || new Date();
        
        // Formatar data para comparação (início e fim do dia)
        const inicioDia = new Date(dataFiltro);
        inicioDia.setHours(0, 0, 0, 0);
        
        const fimDia = new Date(dataFiltro);
        fimDia.setHours(23, 59, 59, 999);
        
        // Query base
        let query = supabase
          .from('resumo_whatsapp')
          .select('*')
          .gte('created_at', inicioDia.toISOString())
          .lte('created_at', fimDia.toISOString());
        
        // Filtro por prefeitura se fornecido
        if (prefeituraFiltro) {
          const nomeCidadeTratado = extrairNomeCidade(prefeituraFiltro);
          query = query.or(`prefeitura.ilike.%${nomeCidadeTratado}%,prefeitura.ilike.%${prefeituraFiltro}%`);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar resumos WhatsApp:', error);
          return;
        }

        const dadosProcessados: ResumoWhatsapp[] = (data || []).map(item => ({
          ...item,
          cidade: extrairNomeCidade(item.prefeitura || ''),
          data_formatada: formatarData(item.created_at)
        }));

        const dadosAgrupados = agruparPorCidade(dadosProcessados);
        setWhatsappPorCidade(dadosAgrupados);
      } catch (error) {
        console.error('Erro inesperado ao buscar resumos WhatsApp:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumoWhatsapp();
  }, [dataSelecionada, prefeituraFiltro]);

  return { whatsappPorCidade, isLoading };
};
