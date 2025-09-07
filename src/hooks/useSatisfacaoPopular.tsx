import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSatisfacaoPopular = (clienteId?: string) => {
  return useQuery({
    queryKey: ['satisfacao-popular', clienteId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('documentos_analisados')
          .select('satisfacao_popular, created_at')
          .eq('status', 'concluído');

        if (clienteId) {
          query = query.eq('cliente_id', clienteId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Erro ao buscar satisfação popular:', error);
          return { valor: 0, dataRealizacao: null };
        }

        if (!data || data.length === 0) {
          return { valor: 0, dataRealizacao: null };
        }

        // Filtrar e processar valores válidos
        const documentosValidos = data
          .filter((doc: any) => doc.satisfacao_popular && doc.satisfacao_popular !== '')
          .map((doc: any) => {
            const valor = parseFloat(doc.satisfacao_popular);
            return {
              valor: isNaN(valor) ? 0 : valor,
              created_at: doc.created_at
            };
          })
          .filter((doc: any) => doc.valor > 0);

        if (documentosValidos.length === 0) {
          return { valor: 0, dataRealizacao: null };
        }

        // Calcular a média e pegar a data mais recente
        const media = documentosValidos.reduce((sum: number, doc: any) => sum + doc.valor, 0) / documentosValidos.length;
        const dataMaisRecente = documentosValidos
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
          .created_at;
        
        return {
          valor: Math.round(media),
          dataRealizacao: dataMaisRecente ? new Date(dataMaisRecente) : null
        };
      } catch (error) {
        console.error('Erro ao processar satisfação popular:', error);
        return { valor: 0, dataRealizacao: null };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
};