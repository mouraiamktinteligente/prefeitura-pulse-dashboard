import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';

interface CriarCampanhaData {
  cliente_id: string;
  tipo_solicitacao: 'analise' | 'descricao_personalizada';
  documento_analise_id?: string;
  descricao_personalizada?: string;
  tipo_postagem: 'feed' | 'story' | 'ambos';
}

export const useMarketingCampanhas = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: campanhas, isLoading } = useQuery({
    queryKey: ['marketing-campanhas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_campanhas')
        .select(`
          *,
          cadastro_clientes (
            nome_completo,
            endereco_cidade
          ),
          documentos_analisados (
            nome_arquivo
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const criarCampanhaMutation = useMutation({
    mutationFn: async (data: CriarCampanhaData) => {
      const { data: campanha, error } = await supabase
        .from('marketing_campanhas')
        .insert({
          ...data,
          usuario_solicitante: user?.email || 'usuario',
        })
        .select()
        .single();

      if (error) throw error;
      return campanha;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campanhas'] });
      toast({
        title: "Campanha criada",
        description: "A campanha foi enviada para processamento",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar campanha",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const atualizarStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('marketing_campanhas')
        .update({ status_campanha: status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campanhas'] });
    },
  });

  const excluirCampanhaMutation = useMutation({
    mutationFn: async (campanhaId: string) => {
      // Primeiro, excluir as imagens relacionadas
      const { error: imagensError } = await supabase
        .from('marketing_imagens')
        .delete()
        .eq('campanha_id', campanhaId);

      if (imagensError) throw imagensError;

      // Depois, excluir a campanha
      const { error: campanhaError } = await supabase
        .from('marketing_campanhas')
        .delete()
        .eq('id', campanhaId);

      if (campanhaError) throw campanhaError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campanhas'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-imagens'] });
      toast({
        title: "Campanha excluída",
        description: "A campanha foi excluída com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir campanha",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    campanhas,
    isLoading,
    criarCampanha: criarCampanhaMutation.mutate,
    isCreating: criarCampanhaMutation.isPending,
    atualizarStatus: atualizarStatusMutation.mutate,
    excluirCampanha: excluirCampanhaMutation.mutate,
    isDeleting: excluirCampanhaMutation.isPending,
  };
};