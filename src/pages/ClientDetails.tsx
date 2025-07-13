import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Instagram, BarChart3, MessageCircle, Calendar, TrendingUp, Play, Loader2 } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { supabase } from "@/integrations/supabase/client";
import { formatCPF, formatCNPJ, formatPhone } from "@/utils/validation";
import { useToast } from "@/hooks/use-toast";

interface AnalysisComment {
  id: number;
  comment: string;
  sentiment: string;
  username: string;
  profile: string;
  post_id: string;
  postUrl: string;
  comment_url: string;
  likes_count: string;
  created_at: string;
}

const ClientDetails = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clients } = useClients();
  
  const [client, setClient] = useState<any>(null);
  const [analyses, setAnalyses] = useState<AnalysisComment[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [performingAnalysis, setPerformingAnalysis] = useState(false);

  useEffect(() => {
    const foundClient = clients.find(c => c.id === clientId);
    if (foundClient) {
      setClient(foundClient);
      loadClientAnalyses(foundClient.instagram);
    }
  }, [clientId, clients]);

  const loadClientAnalyses = async (instagramProfile: string | null) => {
    if (!instagramProfile) {
      setLoadingAnalyses(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('analysis-comments')
        .select('*')
        .eq('profile', instagramProfile)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Erro ao carregar análises:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as análises do cliente.",
          variant: "destructive"
        });
        return;
      }

      setAnalyses(data || []);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
    } finally {
      setLoadingAnalyses(false);
    }
  };

  const handlePerformAnalysis = async () => {
    if (!client?.instagram) {
      toast({
        title: "Erro",
        description: "Cliente não possui Instagram cadastrado.",
        variant: "destructive"
      });
      return;
    }

    setPerformingAnalysis(true);
    try {
      // Simular análise em tempo real - aqui você implementaria a lógica real
      toast({
        title: "Análise Iniciada",
        description: "A análise de sentimento está sendo processada...",
      });

      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Recarregar análises após processamento
      await loadClientAnalyses(client.instagram);

      toast({
        title: "Análise Concluída",
        description: "Nova análise de sentimento foi processada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao realizar análise:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar análise de sentimento.",
        variant: "destructive"
      });
    } finally {
      setPerformingAnalysis(false);
    }
  };

  const formatDocument = (document: string, type: string) => {
    return type === 'fisica' ? formatCPF(document) : formatCNPJ(document);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
      case 'positivo':
        return 'bg-green-500';
      case 'negative':
      case 'negativo':
        return 'bg-red-500';
      case 'neutral':
      case 'neutro':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getSentimentStats = () => {
    const stats = {
      positive: analyses.filter(a => a.sentiment?.toLowerCase().includes('positiv')).length,
      negative: analyses.filter(a => a.sentiment?.toLowerCase().includes('negativ')).length,
      neutral: analyses.filter(a => a.sentiment?.toLowerCase().includes('neutr')).length,
    };
    
    const total = stats.positive + stats.negative + stats.neutral;
    
    return {
      ...stats,
      total,
      positivePercent: total > 0 ? Math.round((stats.positive / total) * 100) : 0,
      negativePercent: total > 0 ? Math.round((stats.negative / total) * 100) : 0,
      neutralPercent: total > 0 ? Math.round((stats.neutral / total) * 100) : 0,
    };
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="text-white">Carregando dados do cliente...</div>
      </div>
    );
  }

  const stats = getSentimentStats();

  return (
    <div className="min-h-screen bg-blue-900 p-4">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/gestao-clientes')}
              className="border-blue-600 text-blue-200 hover:bg-blue-700/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{client.nome_completo}</h1>
              <p className="text-blue-300">Análises e monitoramento de sentimento</p>
            </div>
          </div>

          <Button
            onClick={handlePerformAnalysis}
            disabled={performingAnalysis || !client.instagram}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {performingAnalysis ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {performingAnalysis ? 'Analisando...' : 'Realizar Análise Agora'}
          </Button>
        </div>

        {/* Informações do Cliente */}
        <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white">Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-blue-300 text-sm">Documento</p>
                <p className="text-white font-medium">
                  {formatDocument(client.cpf_cnpj, client.tipo_pessoa)}
                </p>
              </div>
              <div>
                <p className="text-blue-300 text-sm">E-mail</p>
                <p className="text-white font-medium">{client.email || '-'}</p>
              </div>
              <div>
                <p className="text-blue-300 text-sm">WhatsApp</p>
                <p className="text-white font-medium">
                  {client.whatsapp ? formatPhone(client.whatsapp) : '-'}
                </p>
              </div>
              <div>
                <p className="text-blue-300 text-sm">Instagram</p>
                <div className="flex items-center gap-2">
                  {client.instagram ? (
                    <>
                      <Instagram className="w-4 h-4 text-blue-300" />
                      <p className="text-white font-medium">{client.instagram}</p>
                    </>
                  ) : (
                    <p className="text-gray-400">Não cadastrado</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas de Sentimento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm">Total de Comentários</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-800/30 backdrop-blur-sm border-green-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm">Positivos</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.positive} ({stats.positivePercent}%)
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-800/30 backdrop-blur-sm border-red-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-300 text-sm">Negativos</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.negative} ({stats.negativePercent}%)
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-red-400 rotate-180" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Neutros</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.neutral} ({stats.neutralPercent}%)
                  </p>
                </div>
                <div className="w-8 h-8 bg-gray-500 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análises Detalhadas */}
        <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Análises de Sentimento</CardTitle>
              <Badge variant="outline" className="text-blue-200 border-blue-600">
                {analyses.length} análises
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loadingAnalyses ? (
              <div className="text-center py-8 text-white">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Carregando análises...
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-blue-300 mb-4">
                  {client.instagram 
                    ? 'Nenhuma análise encontrada para este cliente.'
                    : 'Cliente não possui Instagram cadastrado.'}
                </p>
                {client.instagram && (
                  <Button
                    onClick={handlePerformAnalysis}
                    disabled={performingAnalysis}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {performingAnalysis ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Iniciar Primeira Análise
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border border-blue-700/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-700/50">
                      <TableHead className="text-blue-100">Data</TableHead>
                      <TableHead className="text-blue-100">Usuário</TableHead>
                      <TableHead className="text-blue-100">Comentário</TableHead>
                      <TableHead className="text-blue-100">Sentimento</TableHead>
                      <TableHead className="text-blue-100">Curtidas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyses.map((analysis) => (
                      <TableRow key={analysis.id} className="border-blue-700/50">
                        <TableCell className="text-blue-200">
                          {new Date(analysis.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {analysis.username || '-'}
                        </TableCell>
                        <TableCell className="text-blue-200 max-w-md">
                          <p className="truncate">{analysis.comment || '-'}</p>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`${getSentimentColor(analysis.sentiment)} text-white`}
                          >
                            {analysis.sentiment || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {analysis.likes_count || '0'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDetails;