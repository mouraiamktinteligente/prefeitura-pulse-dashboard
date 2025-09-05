import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CalendarioEvento {
  id: string;
  cliente_id: string;
  nome_evento: string;
  data_evento: string;
  hora_evento: string;
  objetivo?: string;
  mensagem?: string;
  publico_alvo?: string;
  hashtags?: string[];
  tipo?: string;
  profile?: string;
  created_at: string;
  updated_at: string;
}

interface CriarEventoData {
  cliente_id: string;
  nome_evento: string;
  data_evento: string;
  hora_evento: string;
  objetivo?: string;
  mensagem?: string;
  publico_alvo?: string;
  hashtags?: string[];
  tipo?: string;
  profile?: string;
}

export const useCalendarioEventos = (clienteId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: eventos, isLoading } = useQuery({
    queryKey: ['calendario-eventos', clienteId],
    queryFn: async () => {
      let query = supabase
        .from('calendario_de_eventos')
        .select('*')
        .order('data_evento', { ascending: true });

      if (clienteId) {
        query = query.eq('cliente_id', clienteId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as CalendarioEvento[];
    },
    enabled: !!clienteId,
  });

  const criarEventoMutation = useMutation({
    mutationFn: async (data: CriarEventoData) => {
      // Get client profile if not provided
      let profileData = data.profile;
      if (!profileData && data.cliente_id) {
        const { data: cliente, error: clienteError } = await supabase
          .from('cadastro_clientes')
          .select('instagram_prefeitura')
          .eq('id', data.cliente_id)
          .single();
        
        if (!clienteError && cliente?.instagram_prefeitura) {
          profileData = cliente.instagram_prefeitura;
        }
      }

      const { data: evento, error } = await supabase
        .from('calendario_de_eventos')
        .insert({
          ...data,
          profile: profileData
        })
        .select()
        .single();

      if (error) throw error;
      return evento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendario-eventos'] });
      toast({
        title: "Evento criado",
        description: "O evento foi criado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar evento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const atualizarEventoMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CalendarioEvento> & { id: string }) => {
      const { error } = await supabase
        .from('calendario_de_eventos')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendario-eventos'] });
      toast({
        title: "Evento atualizado",
        description: "O evento foi atualizado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar evento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletarEventoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calendario_de_eventos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendario-eventos'] });
      toast({
        title: "Evento excluído",
        description: "O evento foi excluído com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir evento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    eventos,
    isLoading,
    criarEvento: criarEventoMutation.mutate,
    isCreating: criarEventoMutation.isPending,
    atualizarEvento: atualizarEventoMutation.mutate,
    isUpdating: atualizarEventoMutation.isPending,
    deletarEvento: deletarEventoMutation.mutate,
    isDeleting: deletarEventoMutation.isPending,
  };
};