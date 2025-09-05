import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSatisfacaoPopular = (clienteId?: string) => {
  return useQuery({
    queryKey: ['satisfacao-popular', clienteId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('documentos_analisados')
          .select('satisfacao_popular')
          .eq('status', 'concluído');

        if (clienteId) {
          query = query.eq('cliente_id', clienteId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Erro ao buscar satisfação popular:', error);
          return 0;
        }

        if (!data || data.length === 0) {
          return 0;
        }

        // Filtrar e processar valores válidos
        const valoresValidos = data
          .filter((doc: any) => doc.satisfacao_popular && doc.satisfacao_popular !== '')
          .map((doc: any) => {
            const valor = parseFloat(doc.satisfacao_popular);
            return isNaN(valor) ? 0 : valor;
          })
          .filter((valor: number) => valor > 0);

        if (valoresValidos.length === 0) {
          return 0;
        }

        // Calcular a média
        const media = valoresValidos.reduce((sum: number, valor: number) => sum + valor, 0) / valoresValidos.length;
        return Math.round(media);
      } catch (error) {
        console.error('Erro ao processar satisfação popular:', error);
        return 0;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
};