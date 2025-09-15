import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface PostsMonitorados {
  totalPostsMonitorados: number;
}

export const usePostsMonitorados = (prefeitoProfile?: string, prefeituraProfile?: string) => {
  const [postsData, setPostsData] = useState<PostsMonitorados>({
    totalPostsMonitorados: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPostsMonitorados = useCallback(async () => {
    if (!prefeitoProfile && !prefeituraProfile) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Criar array com os perfis disponíveis
      const profiles = [prefeitoProfile, prefeituraProfile].filter(Boolean);
      
      console.log('usePostsMonitorados - Buscando dados para perfis:', profiles);
      
      // Usar a função RPC que criamos
      const { data, error } = await supabase.rpc('buscar_posts_monitorados', {
        perfis: profiles
      });

      if (error) {
        console.error('Erro ao buscar posts monitorados:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados de posts monitorados",
          variant: "destructive",
        });
        return;
      }

      console.log('usePostsMonitorados - Dados retornados:', data);
      
      // A função retorna um array de objetos com total_posts
      const totalPosts = data?.[0]?.total_posts || 0;

      console.log('usePostsMonitorados - Total de posts encontrados:', totalPosts);
      
      setPostsData({
        totalPostsMonitorados: totalPosts
      });

    } catch (error) {
      console.error('Erro inesperado ao buscar posts monitorados:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [prefeitoProfile, prefeituraProfile, toast]);

  useEffect(() => {
    fetchPostsMonitorados();
  }, [fetchPostsMonitorados]);

  return {
    totalPostsMonitorados: postsData.totalPostsMonitorados,
    loading
  };
};