import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RelatorioAnaliseInstagram {
  id: number;
  created_at: string;
  profile: string | null;
  link_relatorio: string | null;
  nome?: string;
  nome_documento?: string;
}

interface RelatorioAnalisePrefeito {
  id: number;
  created_at: string;
  profile: string | null;
  link_relatorio: string | null;
  nome?: string;
  nome_documento?: string;
}

interface RelatorioAnaliseWeb {
  id: number;
  created_at: string;
  profile: string | null;
  link_relatorio: string | null;
  nome?: string;
  nome_documento?: string;
}

interface RelatorioQualitativo {
  id: number;
  created_at: string;
  profile: string | null;
  link_relatorio: string | null;
  nome?: string;
  nome_documento?: string;
}

export const useRelatoriosAnalise = () => {
  const [relatoriosInstagram, setRelatoriosInstagram] = useState<RelatorioAnaliseInstagram[]>([]);
  const [relatoriosPrefeito, setRelatoriosPrefeito] = useState<RelatorioAnalisePrefeito[]>([]);
  const [relatoriosWeb, setRelatoriosWeb] = useState<RelatorioAnaliseWeb[]>([]);
  const [relatoriosQualitativo, setRelatoriosQualitativo] = useState<RelatorioQualitativo[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Setup realtime listeners
  useEffect(() => {
    const setupRealtimeListeners = () => {
      // Listener para relatórios Instagram
      const instagramChannel = supabase
        .channel('relatorio-instagram-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'relatorio_analise_instagram'
        }, (payload) => {
          console.log('Instagram realtime event:', payload);
          if (payload.eventType === 'INSERT') {
            setRelatoriosInstagram(prev => [payload.new as RelatorioAnaliseInstagram, ...prev]);
            toast({
              title: "Novo relatório Instagram",
              description: "Um novo relatório foi gerado",
            });
          } else if (payload.eventType === 'DELETE') {
            setRelatoriosInstagram(prev => prev.filter(r => r.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setRelatoriosInstagram(prev => prev.map(r => 
              r.id === payload.new.id ? payload.new as RelatorioAnaliseInstagram : r
            ));
          }
        })
        .subscribe();

      // Listener para relatórios Prefeito
      const prefeitoChannel = supabase
        .channel('relatorio-prefeito-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'relatorio_analise_prefeito'
        }, (payload) => {
          console.log('Prefeito realtime event:', payload);
          if (payload.eventType === 'INSERT') {
            setRelatoriosPrefeito(prev => [payload.new as RelatorioAnalisePrefeito, ...prev]);
            toast({
              title: "Novo relatório Prefeito",
              description: "Um novo relatório foi gerado",
            });
          } else if (payload.eventType === 'DELETE') {
            setRelatoriosPrefeito(prev => prev.filter(r => r.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setRelatoriosPrefeito(prev => prev.map(r => 
              r.id === payload.new.id ? payload.new as RelatorioAnalisePrefeito : r
            ));
          }
        })
        .subscribe();

      // Listener para relatórios Web
      const webChannel = supabase
        .channel('relatorio-web-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'relatorio_analise_web'
        }, (payload) => {
          console.log('Web realtime event:', payload);
          if (payload.eventType === 'INSERT') {
            setRelatoriosWeb(prev => [payload.new as RelatorioAnaliseWeb, ...prev]);
            toast({
              title: "Novo relatório Web",
              description: "Um novo relatório foi gerado",
            });
          } else if (payload.eventType === 'DELETE') {
            setRelatoriosWeb(prev => prev.filter(r => r.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setRelatoriosWeb(prev => prev.map(r => 
              r.id === payload.new.id ? payload.new as RelatorioAnaliseWeb : r
            ));
          }
        })
        .subscribe();

      // Listener para relatórios Qualitativo
      const qualitativoChannel = supabase
        .channel('relatorio-qualitativo-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'relatorio_qualitativo'
        }, (payload) => {
          console.log('Qualitativo realtime event:', payload);
          if (payload.eventType === 'INSERT') {
            setRelatoriosQualitativo(prev => [payload.new as RelatorioQualitativo, ...prev]);
            toast({
              title: "Novo relatório Qualitativo",
              description: "Um novo relatório foi gerado",
            });
          } else if (payload.eventType === 'DELETE') {
            setRelatoriosQualitativo(prev => prev.filter(r => r.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setRelatoriosQualitativo(prev => prev.map(r => 
              r.id === payload.new.id ? payload.new as RelatorioQualitativo : r
            ));
          }
        })
        .subscribe();

      return [instagramChannel, prefeitoChannel, webChannel, qualitativoChannel];
    };

    const channels = setupRealtimeListeners();

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [toast]);

  const fetchRelatoriosInstagram = async (instagramProfile?: string) => {
    if (!instagramProfile) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('relatorio_analise_instagram')
        .select('*')
        .eq('profile', instagramProfile)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar relatórios do Instagram:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar relatórios do Instagram",
          variant: "destructive",
        });
        return;
      }

      setRelatoriosInstagram(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar relatórios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteRelatorioInstagram = async (relatorio: RelatorioAnaliseInstagram) => {
    try {
      const { error } = await supabase
        .from('relatorio_analise_instagram')
        .delete()
        .eq('id', relatorio.id);

      if (error) {
        console.error('Erro ao deletar relatório:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar relatório",
          variant: "destructive",
        });
        return;
      }

      setRelatoriosInstagram(prev => prev.filter(r => r.id !== relatorio.id));
      toast({
        title: "Sucesso",
        description: "Relatório deletado com sucesso",
      });
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao deletar relatório",
        variant: "destructive",
      });
    }
  };

  // Funções para Relatório de Análise do Prefeito
  const fetchRelatoriosPrefeito = async (instagramProfile?: string) => {
    console.log('DEBUG: fetchRelatoriosPrefeito chamado com profile:', instagramProfile);
    if (!instagramProfile) {
      console.log('DEBUG: profile não fornecido, saindo...');
      return;
    }
    
    setLoading(true);
    try {
      console.log('DEBUG: Fazendo query na tabela relatorio_analise_prefeito...');
      const { data, error } = await supabase
        .from('relatorio_analise_prefeito')
        .select('*')
        .eq('profile', instagramProfile)
        .order('created_at', { ascending: false });

      console.log('DEBUG: Resultado da query prefeito:', { data, error });

      if (error) {
        console.error('Erro ao buscar relatórios do Prefeito:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar relatórios do Prefeito",
          variant: "destructive",
        });
        return;
      }

      console.log('DEBUG: Dados encontrados para Prefeito:', data?.length || 0, 'itens');
      setRelatoriosPrefeito(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar relatórios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteRelatorioPrefeito = async (relatorio: RelatorioAnalisePrefeito) => {
    try {
      const { error } = await supabase
        .from('relatorio_analise_prefeito')
        .delete()
        .eq('id', relatorio.id);

      if (error) {
        console.error('Erro ao deletar relatório:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar relatório",
          variant: "destructive",
        });
        return;
      }

      setRelatoriosPrefeito(prev => prev.filter(r => r.id !== relatorio.id));
      toast({
        title: "Sucesso",
        description: "Relatório deletado com sucesso",
      });
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao deletar relatório",
        variant: "destructive",
      });
    }
  };

  // Funções para Relatório de Análise Web
  const fetchRelatoriosWeb = async (instagramProfile?: string) => {
    console.log('DEBUG: fetchRelatoriosWeb chamado com profile:', instagramProfile);
    if (!instagramProfile) {
      console.log('DEBUG: profile não fornecido, saindo...');
      return;
    }
    
    setLoading(true);
    try {
      console.log('DEBUG: Fazendo query na tabela relatorio_analise_web...');
      const { data, error } = await supabase
        .from('relatorio_analise_web')
        .select('*')
        .eq('profile', instagramProfile)
        .order('created_at', { ascending: false });

      console.log('DEBUG: Resultado da query web:', { data, error });

      if (error) {
        console.error('Erro ao buscar relatórios Web:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar relatórios Web",
          variant: "destructive",
        });
        return;
      }

      console.log('DEBUG: Dados encontrados para Web:', data?.length || 0, 'itens');
      setRelatoriosWeb(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar relatórios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteRelatorioWeb = async (relatorio: RelatorioAnaliseWeb) => {
    try {
      const { error } = await supabase
        .from('relatorio_analise_web')
        .delete()
        .eq('id', relatorio.id);

      if (error) {
        console.error('Erro ao deletar relatório:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar relatório",
          variant: "destructive",
        });
        return;
      }

      setRelatoriosWeb(prev => prev.filter(r => r.id !== relatorio.id));
      toast({
        title: "Sucesso",
        description: "Relatório deletado com sucesso",
      });
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao deletar relatório",
        variant: "destructive",
      });
    }
  };

  // Funções para Relatório Qualitativo
  const fetchRelatoriosQualitativo = async (instagramProfile?: string) => {
    console.log('DEBUG: fetchRelatoriosQualitativo chamado com profile:', instagramProfile);
    if (!instagramProfile) {
      console.log('DEBUG: profile não fornecido, saindo...');
      return;
    }
    
    setLoading(true);
    try {
      console.log('DEBUG: Fazendo query na tabela relatorio_qualitativo...');
      const { data, error } = await supabase
        .from('relatorio_qualitativo')
        .select('*')
        .eq('profile', instagramProfile)
        .order('created_at', { ascending: false });

      console.log('DEBUG: Resultado da query qualitativo:', { data, error });

      if (error) {
        console.error('Erro ao buscar relatórios Qualitativos:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar relatórios Qualitativos",
          variant: "destructive",
        });
        return;
      }

      console.log('DEBUG: Dados encontrados para Qualitativo:', data?.length || 0, 'itens');
      setRelatoriosQualitativo(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar relatórios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteRelatorioQualitativo = async (relatorio: RelatorioQualitativo) => {
    try {
      const { error } = await supabase
        .from('relatorio_qualitativo')
        .delete()
        .eq('id', relatorio.id);

      if (error) {
        console.error('Erro ao deletar relatório:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar relatório",
          variant: "destructive",
        });
        return;
      }

      setRelatoriosQualitativo(prev => prev.filter(r => r.id !== relatorio.id));
      toast({
        title: "Sucesso",
        description: "Relatório deletado com sucesso",
      });
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao deletar relatório",
        variant: "destructive",
      });
    }
  };

  // Função genérica para download
  const downloadRelatorio = async (relatorio: { link_relatorio: string | null }) => {
    if (!relatorio.link_relatorio) {
      toast({
        title: "Erro",
        description: "Link de relatório não disponível",
        variant: "destructive",
      });
      return;
    }

    try {
      window.open(relatorio.link_relatorio, '_blank');
    } catch (error) {
      console.error('Erro ao abrir relatório:', error);
      toast({
        title: "Erro",
        description: "Erro ao abrir relatório",
        variant: "destructive",
      });
    }
  };

  return {
    relatoriosInstagram,
    relatoriosPrefeito,
    relatoriosWeb,
    relatoriosQualitativo,
    loading,
    fetchRelatoriosInstagram,
    fetchRelatoriosPrefeito,
    fetchRelatoriosWeb,
    fetchRelatoriosQualitativo,
    deleteRelatorioInstagram,
    deleteRelatorioPrefeito,
    deleteRelatorioWeb,
    deleteRelatorioQualitativo,
    downloadRelatorio
  };
};