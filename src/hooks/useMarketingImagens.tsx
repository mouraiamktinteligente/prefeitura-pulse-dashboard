import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';

export const useMarketingImagens = (campanhaId?: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: imagens, isLoading } = useQuery({
    queryKey: ['marketing-imagens', campanhaId],
    queryFn: async () => {
      const query = supabase
        .from('marketing_imagens')
        .select('*')
        .order('created_at', { ascending: false });

      if (campanhaId) {
        query.eq('campanha_id', campanhaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!campanhaId,
  });

  const aprovarImagemMutation = useMutation({
    mutationFn: async (imagemId: string) => {
      const { error } = await supabase
        .from('marketing_imagens')
        .update({
          status_aprovacao: 'aprovada',
          aprovado_por: user?.email || 'usuario',
          data_aprovacao: new Date().toISOString(),
        })
        .eq('id', imagemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-imagens'] });
      toast({
        title: "Imagem aprovada",
        description: "A imagem foi aprovada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao aprovar imagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejeitarImagemMutation = useMutation({
    mutationFn: async ({ imagemId, observacoes }: { imagemId: string; observacoes?: string }) => {
      const { error } = await supabase
        .from('marketing_imagens')
        .update({
          status_aprovacao: 'rejeitada',
          observacoes_rejeicao: observacoes,
          aprovado_por: user?.email || 'usuario',
          data_aprovacao: new Date().toISOString(),
        })
        .eq('id', imagemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-imagens'] });
      toast({
        title: "Imagem rejeitada",
        description: "A imagem foi rejeitada e será reprocessada",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao rejeitar imagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    imagens,
    isLoading,
    aprovarImagem: aprovarImagemMutation.mutate,
    rejeitarImagem: rejeitarImagemMutation.mutate,
    isApproving: aprovarImagemMutation.isPending,
    isRejecting: rejeitarImagemMutation.isPending,
  };
};