import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RelatorioAnaliseInstagram {
  id: number;
  created_at: string;
  profile: string | null;
  link_relatorio: string | null;
}

export const useRelatoriosAnalise = () => {
  const [relatoriosInstagram, setRelatoriosInstagram] = useState<RelatorioAnaliseInstagram[]>([]);
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

  const downloadRelatorio = async (relatorio: RelatorioAnaliseInstagram) => {
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
    loading,
    fetchRelatoriosInstagram,
    deleteRelatorioInstagram,
    downloadRelatorio
  };
};