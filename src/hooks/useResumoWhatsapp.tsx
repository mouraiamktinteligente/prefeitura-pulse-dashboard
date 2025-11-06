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

export const useResumoWhatsapp = () => {
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
        
        const { data, error } = await supabase
          .from('resumo_whatsapp')
          .select('*')
          .order('created_at', { ascending: false });

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
  }, []);

  return { whatsappPorCidade, isLoading };
};
