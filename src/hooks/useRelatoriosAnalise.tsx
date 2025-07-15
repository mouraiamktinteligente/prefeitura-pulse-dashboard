import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RelatorioAnaliseInstagram {
  id: number;
  created_at: string;
  profile: string | null;
  link_relatorio: string | null;
}

interface RelatorioAnalisePrefeito {
  id: number;
  created_at: string;
  profile: string | null;
  link_relatorio: string | null;
}

interface RelatorioAnaliseWeb {
  id: number;
  created_at: string;
  profile: string | null;
  link_relatorio: string | null;
}

interface RelatorioQualitativo {
  id: number;
  created_at: string;
  profile: string | null;
  link_relatorio: string | null;
}

export const useRelatoriosAnalise = () => {
  const [relatoriosInstagram, setRelatoriosInstagram] = useState<RelatorioAnaliseInstagram[]>([]);
  const [relatoriosPrefeito, setRelatoriosPrefeito] = useState<RelatorioAnalisePrefeito[]>([]);
  const [relatoriosWeb, setRelatoriosWeb] = useState<RelatorioAnaliseWeb[]>([]);
  const [relatoriosQualitativo, setRelatoriosQualitativo] = useState<RelatorioQualitativo[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
    if (!instagramProfile) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('relatorio_analise_prefeito')
        .select('*')
        .eq('profile', instagramProfile)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar relatórios do Prefeito:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar relatórios do Prefeito",
          variant: "destructive",
        });
        return;
      }

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
    if (!instagramProfile) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('relatorio_analise_web')
        .select('*')
        .eq('profile', instagramProfile)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar relatórios Web:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar relatórios Web",
          variant: "destructive",
        });
        return;
      }

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
    if (!instagramProfile) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('relatorio_qualitativo')
        .select('*')
        .eq('profile', instagramProfile)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar relatórios Qualitativos:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar relatórios Qualitativos",
          variant: "destructive",
        });
        return;
      }

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