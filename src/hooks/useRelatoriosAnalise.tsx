import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';

interface RelatorioAnaliseInstagram {
  id: number;
  created_at: string;
  profile: string | null;
  link_relatorio: string | null;
  link_analise: string | null;
  nome?: string;
  nome_documento?: string;
}

interface RelatorioAnalisePrefeito {
  id: number;
  created_at: string;
  profile: string | null;
  link_relatorio: string | null;
  link_analise: string | null;
  nome?: string;
  nome_relatorio?: string;
  nome_analise?: string;
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

interface RelatorioAnaliseConsolidada {
  id: number;
  created_at: string;
  profile: string | null;
  link_analise: string | null;
  nome?: string;
  nome_analise?: string;
  id_analise?: string;
}

// Função auxiliar para deduplicar relatórios
const deduplicateReports = <T extends { id: number; profile: string | null; nome_documento?: string | null; created_at: string }>(
  reports: T[]
): T[] => {
  const seen = new Set<string>();
  return reports.filter(report => {
    if (!report.profile || !report.nome_documento) return true;
    
    const dateKey = new Date(report.created_at).toDateString();
    const key = `${report.profile}-${report.nome_documento}-${dateKey}`;
    
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const useRelatoriosAnalise = () => {
  const { user } = useAuth();
  const [relatoriosInstagram, setRelatoriosInstagram] = useState<RelatorioAnaliseInstagram[]>([]);
  const [relatoriosPrefeito, setRelatoriosPrefeito] = useState<RelatorioAnalisePrefeito[]>([]);
  const [relatoriosWeb, setRelatoriosWeb] = useState<RelatorioAnaliseWeb[]>([]);
  const [relatoriosQualitativo, setRelatoriosQualitativo] = useState<RelatorioQualitativo[]>([]);
  const [relatoriosConsolidados, setRelatoriosConsolidados] = useState<RelatorioAnaliseConsolidada[]>([]);
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

      // Listener para relatórios Consolidados
      const consolidadoChannel = supabase
        .channel('relatorio-consolidado-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'analise_consolidada_semanal'
        }, (payload) => {
          console.log('Consolidado realtime event:', payload);
          if (payload.eventType === 'INSERT') {
            setRelatoriosConsolidados(prev => [payload.new as RelatorioAnaliseConsolidada, ...prev]);
            toast({
              title: "Novo relatório Consolidado",
              description: "Um novo relatório semanal foi gerado",
            });
          } else if (payload.eventType === 'DELETE') {
            setRelatoriosConsolidados(prev => prev.filter(r => r.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setRelatoriosConsolidados(prev => prev.map(r => 
              r.id === payload.new.id ? payload.new as RelatorioAnaliseConsolidada : r
            ));
          }
        })
        .subscribe();

      return [instagramChannel, prefeitoChannel, webChannel, qualitativoChannel, consolidadoChannel];
    };

    const channels = setupRealtimeListeners();

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [toast]);

  const fetchRelatoriosInstagram = async (instagramProfile?: string | string[], dateFilter?: { month: number, year: number }) => {
    if (!instagramProfile || !user?.email) return;
    
    const profiles = Array.isArray(instagramProfile) ? instagramProfile : [instagramProfile];
    const validProfiles = profiles.filter(p => p && p.trim() !== '');
    
    if (validProfiles.length === 0) return;
    
    setLoading(true);
    try {
      console.log('🔍 [DEBUG] Buscando relatórios Instagram para perfis:', validProfiles);
      
      let startDate = null;
      let endDate = null;

      // Aplicar filtro de data se fornecido
      if (dateFilter) {
        const { month, year } = dateFilter;
        startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
      }

      // Usar RPC em vez de query direta
      const { data, error } = await supabase.rpc('get_relatorios_instagram', {
        p_profiles: validProfiles,
        p_session_email: user.email,
        p_start_date: startDate,
        p_end_date: endDate
      });

      if (error) {
        console.error('❌ [ERROR] Erro ao buscar relatórios do Instagram:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar relatórios do Instagram",
          variant: "destructive",
        });
        return;
      }

      console.log('📊 [DEBUG] Dados recebidos da tabela relatorio_analise_instagram:', {
        totalRegistros: data?.length || 0,
        registros: data?.map(r => ({
          id: r.id,
          profile: r.profile,
          nome: r.nome,
          linkRelatorio: r.link_relatorio?.substring(0, 60) + '...',
          linkAnalise: r.link_analise?.substring(0, 60) + '...',
          tipoDetectado: r.profile?.includes('prefeito') ? 'PREFEITO' : 
                        r.profile?.includes('prefeitura') ? 'PREFEITURA' : 'INDEFINIDO'
        }))
      });

      // Validar consistência dos dados
      if (data) {
        data.forEach(relatorio => {
          const isProfilePrefeito = relatorio.profile?.includes('prefeito') || relatorio.profile?.includes('mayor');
          const isProfilePrefeitura = relatorio.profile?.includes('prefeitura') || relatorio.profile?.includes('municipal');
          
          if (!isProfilePrefeito && !isProfilePrefeitura) {
            console.warn(`⚠️ [WARN] Profile não identificado claramente:`, {
              id: relatorio.id,
              profile: relatorio.profile,
              suggestion: 'Verificar se o profile está correto na base de dados'
            });
          }
        });
      }

      // Aplicar deduplicação como fallback
      const uniqueReports = deduplicateReports(data || []);
      console.log('✅ [DEBUG] Relatórios únicos após deduplicação:', uniqueReports.length);
      
      setRelatoriosInstagram(uniqueReports);
    } catch (error) {
      console.error('❌ [ERROR] Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar relatórios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteFromGoogleDrive = async (linkRelatorio: string | null): Promise<boolean> => {
    if (!linkRelatorio) {
      console.log('Relatório não tem link do Google Drive, pulando deleção');
      return true;
    }

    try {
      console.log('Deletando relatório do Google Drive:', linkRelatorio);
      
      const response = await supabase.functions.invoke('google-drive-delete', {
        body: {
          googleDriveUrl: linkRelatorio,
          fileName: 'Relatório de Análise',
          clientName: 'Sistema de Análise',
        },
      });

      if (response.error) {
        console.error('Erro na função de deleção do Google Drive:', response.error);
        return false;
      }

      if (response.data?.success) {
        console.log('✓ Relatório deletado do Google Drive com sucesso');
        return true;
      } else {
        console.error('Resposta de erro na deleção do Google Drive:', response.data);
        return false;
      }
    } catch (error) {
      console.error('Erro ao deletar relatório do Google Drive:', error);
      return false;
    }
  };

  const deleteRelatorioInstagram = async (relatorio: RelatorioAnaliseInstagram) => {
    try {
      // Primeiro, tentar deletar do Google Drive (se existir)
      let driveDeleteSuccess = true;
      if (relatorio.link_relatorio) {
        console.log('Deletando relatório Instagram do Google Drive...');
        driveDeleteSuccess = await deleteFromGoogleDrive(relatorio.link_relatorio);
      }

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
      
      // Mostrar toast baseado no resultado
      if (driveDeleteSuccess) {
        toast({
          title: "Sucesso",
          description: "Relatório deletado com sucesso do banco e Google Drive",
        });
      } else {
        toast({
          title: "Parcialmente deletado",
          description: "Relatório removido do banco, mas houve erro ao deletar do Google Drive",
          variant: "destructive",
        });
      }
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
  const fetchRelatoriosPrefeito = async (instagramProfile?: string, dateFilter?: { month: number, year: number }) => {
    console.log('🔍 [DEBUG] fetchRelatoriosPrefeito chamado com profile:', instagramProfile);
    if (!instagramProfile) {
      console.log('🔍 [DEBUG] profile não fornecido, saindo...');
      return;
    }
    
    setLoading(true);
    try {
      console.log('🔍 [DEBUG] Fazendo query na tabela relatorio_analise_prefeito...');
      let query = supabase
        .from('relatorio_analise_prefeito')
        .select('*')
        .eq('profile', instagramProfile)
        .not('link_relatorio', 'is', null);

      // Aplicar filtro de data se fornecido
      if (dateFilter) {
        const { month, year } = dateFilter;
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
        
        query = query.gte('created_at', startDate).lt('created_at', endDate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      console.log('📊 [DEBUG] Resultado da query prefeito:', { 
        totalRegistros: data?.length || 0,
        error,
        registros: data?.map(r => ({
          id: r.id,
          profile: r.profile,
          nomeDocumento: r.nome || r.nome_relatorio,
          linkRelatorio: r.link_relatorio?.substring(0, 60) + '...',
        }))
      });

      if (error) {
        console.error('❌ [ERROR] Erro ao buscar relatórios do Prefeito:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar relatórios do Prefeito",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ [DEBUG] Dados encontrados para Prefeito:', data?.length || 0, 'itens');
      // Aplicar deduplicação como fallback
      const uniqueReports = deduplicateReports(data || []) as RelatorioAnalisePrefeito[];
      setRelatoriosPrefeito(uniqueReports);
    } catch (error) {
      console.error('❌ [ERROR] Erro inesperado ao buscar relatórios do Prefeito:', error);
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
      // Primeiro, tentar deletar do Google Drive (se existir)
      let driveDeleteSuccess = true;
      if (relatorio.link_relatorio) {
        console.log('Deletando relatório Prefeito do Google Drive...');
        driveDeleteSuccess = await deleteFromGoogleDrive(relatorio.link_relatorio);
      }

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
      
      // Mostrar toast baseado no resultado
      if (driveDeleteSuccess) {
        toast({
          title: "Sucesso",
          description: "Relatório deletado com sucesso do banco e Google Drive",
        });
      } else {
        toast({
          title: "Parcialmente deletado",
          description: "Relatório removido do banco, mas houve erro ao deletar do Google Drive",
          variant: "destructive",
        });
      }
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
  const fetchRelatoriosWeb = async (instagramProfile?: string | string[], dateFilter?: { month: number, year: number }) => {
    console.log('DEBUG: fetchRelatoriosWeb chamado com profile:', instagramProfile);
    if (!instagramProfile || !user?.email) {
      console.log('DEBUG: profile ou email do usuário não fornecido, saindo...');
      return;
    }
    
    const profiles = Array.isArray(instagramProfile) ? instagramProfile : [instagramProfile];
    const validProfiles = profiles.filter(p => p && p.trim() !== '');
    
    if (validProfiles.length === 0) return;
    
    setLoading(true);
    try {
      console.log('DEBUG: Fazendo query via RPC na tabela relatorio_analise_web...');
      
      let startDate = null;
      let endDate = null;

      // Aplicar filtro de data se fornecido
      if (dateFilter) {
        const { month, year } = dateFilter;
        startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
      }

      // Usar RPC em vez de query direta
      const { data, error } = await supabase.rpc('get_relatorios_web', {
        p_profiles: validProfiles,
        p_session_email: user.email,
        p_start_date: startDate,
        p_end_date: endDate
      });

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
      // Aplicar deduplicação como fallback
      const uniqueReports = deduplicateReports(data || []);
      setRelatoriosWeb(uniqueReports);
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
      // Primeiro, tentar deletar do Google Drive (se existir)
      let driveDeleteSuccess = true;
      if (relatorio.link_relatorio) {
        console.log('Deletando relatório Web do Google Drive...');
        driveDeleteSuccess = await deleteFromGoogleDrive(relatorio.link_relatorio);
      }

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
      
      // Mostrar toast baseado no resultado
      if (driveDeleteSuccess) {
        toast({
          title: "Sucesso",
          description: "Relatório deletado com sucesso do banco e Google Drive",
        });
      } else {
        toast({
          title: "Parcialmente deletado",
          description: "Relatório removido do banco, mas houve erro ao deletar do Google Drive",
          variant: "destructive",
        });
      }
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
  const fetchRelatoriosQualitativo = async (instagramProfile?: string, dateFilter?: { month: number, year: number }) => {
    console.log('DEBUG: fetchRelatoriosQualitativo chamado com profile:', instagramProfile);
    if (!instagramProfile || !user?.email) {
      console.log('DEBUG: profile ou email do usuário não fornecido, saindo...');
      return;
    }
    
    setLoading(true);
    try {
      console.log('DEBUG: Fazendo query via RPC na tabela relatorio_qualitativo...');
      
      let startDate = null;
      let endDate = null;

      // Aplicar filtro de data se fornecido
      if (dateFilter) {
        const { month, year } = dateFilter;
        startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
      }

      // Usar RPC em vez de query direta
      const { data, error } = await supabase.rpc('get_relatorios_qualitativo', {
        p_profiles: [instagramProfile],
        p_session_email: user.email,
        p_start_date: startDate,
        p_end_date: endDate
      });

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
      // Aplicar deduplicação como fallback
      const uniqueReports = deduplicateReports(data || []);
      setRelatoriosQualitativo(uniqueReports);
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
      // Primeiro, tentar deletar do Google Drive (se existir)
      let driveDeleteSuccess = true;
      if (relatorio.link_relatorio) {
        console.log('Deletando relatório Qualitativo do Google Drive...');
        driveDeleteSuccess = await deleteFromGoogleDrive(relatorio.link_relatorio);
      }

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
      
      // Mostrar toast baseado no resultado
      if (driveDeleteSuccess) {
        toast({
          title: "Sucesso",
          description: "Relatório deletado com sucesso do banco e Google Drive",
        });
      } else {
        toast({
          title: "Parcialmente deletado",
          description: "Relatório removido do banco, mas houve erro ao deletar do Google Drive",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao deletar relatório",
        variant: "destructive",
      });
    }
  };

  const fetchRelatoriosConsolidados = async (
    instagramProfile?: string | string[], 
    dateFilter?: { month: number, year: number },
    clientNome?: string
  ) => {
    console.log('🔍 [DEBUG] fetchRelatoriosConsolidados chamado com:', {
      instagramProfile,
      dateFilter,
      clientNome
    });
    
    if (!instagramProfile || !user?.email) {
      console.log('🔍 [DEBUG] profile ou email do usuário não fornecido, saindo...');
      return;
    }
    
    const profiles = Array.isArray(instagramProfile) ? instagramProfile : [instagramProfile];
    const validProfiles = profiles.filter(p => p && p.trim() !== '');
    
    if (validProfiles.length === 0) return;
    
    setLoading(true);
    try {
      console.log('🔍 [DEBUG] Query inicial via RPC por perfis:', validProfiles);
      
      let startDate = null;
      let endDate = null;

      // Aplicar filtro de data com janela completa do mês
      if (dateFilter) {
        const { month, year } = dateFilter;
        startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
        
        console.log('🔍 [DEBUG] Filtro de data aplicado:', { startDate, endDate });
      }

      // Usar RPC em vez de query direta
      const { data, error } = await supabase.rpc('get_relatorios_consolidados', {
        p_profiles: validProfiles,
        p_session_email: user.email,
        p_start_date: startDate,
        p_end_date: endDate
      });

      console.log('📊 [DEBUG] Resultado da query consolidada por profile:', { 
        totalRegistros: data?.length || 0,
        error,
        profiles: validProfiles,
        primeirosRegistros: data?.slice(0, 2)
      });

      if (error) {
        console.error('❌ [ERROR] Erro ao buscar relatórios Consolidados:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar relatórios consolidados semanais",
          variant: "destructive",
        });
        return;
      }

      // Fallback: se não encontrou por profile e temos nome do cliente, tentar buscar por nome
      if ((!data || data.length === 0) && clientNome) {
        console.log('🔍 [DEBUG] Fallback: Buscando por nome do cliente:', clientNome);
        
        let fallbackQuery = supabase
          .from('analise_consolidada_semanal' as any)
          .select('*')
          .ilike('nome', `%${clientNome}%`)
          .not('link_analise', 'is', null);

        // Se tinha filtro de data, aplicar também no fallback
        if (dateFilter) {
          const { month, year } = dateFilter;
          const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
          const nextMonth = month === 12 ? 1 : month + 1;
          const nextYear = month === 12 ? year + 1 : year;
          const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
          
          fallbackQuery = fallbackQuery.gte('created_at', startDate).lt('created_at', endDate);
        }

        const { data: fallbackData, error: fallbackError } = await fallbackQuery.order('created_at', { ascending: false });

        console.log('📊 [DEBUG] Resultado do fallback por nome:', {
          totalRegistros: fallbackData?.length || 0,
          error: fallbackError,
          primeirosRegistros: fallbackData?.slice(0, 2)
        });

        if (!fallbackError && fallbackData && fallbackData.length > 0) {
          console.log('✅ [DEBUG] Dados encontrados via fallback por nome:', fallbackData.length, 'itens');
          setRelatoriosConsolidados(fallbackData as unknown as RelatorioAnaliseConsolidada[]);
          return;
        }
      }

      console.log('✅ [DEBUG] Dados encontrados para Consolidados:', data?.length || 0, 'itens');
      setRelatoriosConsolidados((data || []) as unknown as RelatorioAnaliseConsolidada[]);
    } catch (error) {
      console.error('❌ [ERROR] Erro inesperado ao buscar relatórios consolidados:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar relatórios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteRelatorioConsolidado = async (relatorio: RelatorioAnaliseConsolidada) => {
    try {
      // Primeiro, tentar deletar do Google Drive (se existir)
      let driveDeleteSuccess = true;
      if (relatorio.link_analise) {
        console.log('Deletando relatório Consolidado do Google Drive...');
        driveDeleteSuccess = await deleteFromGoogleDrive(relatorio.link_analise);
      }

      const { error } = await supabase
        .from('analise_consolidada_semanal' as any)
        .delete()
        .eq('id', relatorio.id);

      if (error) {
        console.error('Erro ao deletar relatório:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar relatório consolidado",
          variant: "destructive",
        });
        return;
      }

      setRelatoriosConsolidados(prev => prev.filter(r => r.id !== relatorio.id));
      
      // Mostrar toast baseado no resultado
      if (driveDeleteSuccess) {
        toast({
          title: "Sucesso",
          description: "Relatório consolidado deletado com sucesso do banco e Google Drive",
        });
      } else {
        toast({
          title: "Parcialmente deletado",
          description: "Relatório removido do banco, mas houve erro ao deletar do Google Drive",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao deletar relatório consolidado",
        variant: "destructive",
      });
    }
  };

  // Função genérica para download
  const downloadRelatorio = async (relatorio: { link_relatorio: string | null }) => {
    console.log('🔍 [DEBUG] downloadRelatorio chamado:', {
      linkRelatorio: relatorio.link_relatorio?.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });
    
    if (!relatorio.link_relatorio) {
      console.warn('❌ [WARN] Link de relatório não disponível');
      toast({
        title: "Erro",
        description: "Link de relatório não disponível",
        variant: "destructive",
      });
      return;
    }

    try {
      // Log no banco para auditoria
      await supabase.from('debug_relatorios_acesso').insert({
        action: 'DOWNLOAD_RELATORIO',
        profile: 'N/A', // Perfil específico será adicionado quando disponível
        tabela_origem: 'GENERIC_DOWNLOAD', 
        link_acessado: relatorio.link_relatorio,
        metadata: {
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.warn('⚠️ [WARN] Erro ao registrar log de debug:', logError);
    }

    try {
      console.log('✅ [DEBUG] Abrindo link:', relatorio.link_relatorio);
      window.open(relatorio.link_relatorio, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('❌ [ERROR] Erro ao abrir relatório:', error);
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
    relatoriosConsolidados,
    loading,
    fetchRelatoriosInstagram,
    fetchRelatoriosPrefeito,
    fetchRelatoriosWeb,
    fetchRelatoriosQualitativo,
    fetchRelatoriosConsolidados,
    deleteRelatorioInstagram,
    deleteRelatorioPrefeito,
    deleteRelatorioWeb,
    deleteRelatorioQualitativo,
    deleteRelatorioConsolidado,
    downloadRelatorio
  };
};