import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useClients } from '@/hooks/useClients';
import { useDocumentosAnalisados } from '@/hooks/useDocumentosAnalisados';
import { useRelatoriosAnalise } from '@/hooks/useRelatoriosAnalise';
import { formatCPF, formatCNPJ, formatPhone } from '@/utils/validation';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Instagram, 
  BarChart3,
  FileText,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
  Users,
  Globe,
  BarChart
} from 'lucide-react';

const ClientDetails = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { clients, loading: clientsLoading } = useClients();
  const { documentos, loading: docsLoading, fetchDocumentos, deleteDocument, downloadAnalise, downloadPlano } = useDocumentosAnalisados();
  const { 
    relatoriosInstagram, 
    relatoriosPrefeito, 
    relatoriosWeb, 
    relatoriosQualitativo, 
    loading: relatoriosLoading, 
    fetchRelatoriosInstagram, 
    fetchRelatoriosPrefeito, 
    fetchRelatoriosWeb, 
    fetchRelatoriosQualitativo, 
    deleteRelatorioInstagram, 
    deleteRelatorioPrefeito, 
    deleteRelatorioWeb, 
    deleteRelatorioQualitativo, 
    downloadRelatorio 
  } = useRelatoriosAnalise();
  const { toast } = useToast();

  const client = clients.find(c => c.id === clientId);

  useEffect(() => {
    if (clientId) {
      fetchDocumentos(clientId);
    }
  }, [clientId]); // Removido fetchDocumentos das dependências para evitar loops

  useEffect(() => {
    if (client?.instagram_prefeitura || client?.instagram_prefeito) {
      const profiles = [client.instagram_prefeitura, client.instagram_prefeito].filter(Boolean);
      
      if (profiles.length > 0) {
        fetchRelatoriosInstagram(profiles);
        fetchRelatoriosWeb(profiles);
        
        // For Mayor reports, try both profiles
        if (client.instagram_prefeito) {
          fetchRelatoriosPrefeito(client.instagram_prefeito);
          fetchRelatoriosQualitativo(client.instagram_prefeito);
        } else if (client.instagram_prefeitura) {
          fetchRelatoriosPrefeito(client.instagram_prefeitura);
          fetchRelatoriosQualitativo(client.instagram_prefeitura);
        }
      }
    }
  }, [client?.instagram_prefeitura, client?.instagram_prefeito]);


  const formatDocument = (document: string, type: string): string => {
    return type === 'fisica' ? formatCPF(document) : formatCNPJ(document);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'processando':
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
      case 'concluído':
      case 'finalizado':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'erro':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pendente: 'secondary',
      processando: 'default',
      concluído: 'default',
      finalizado: 'default',
      erro: 'destructive'
    } as const;

    const colors = {
      pendente: 'bg-yellow-900/20 text-yellow-300 border-yellow-700',
      processando: 'bg-blue-900/20 text-blue-300 border-blue-700',
      concluído: 'bg-green-900/20 text-green-300 border-green-700',
      finalizado: 'bg-green-900/20 text-green-300 border-green-700',
      erro: 'bg-red-900/20 text-red-300 border-red-700'
    };

    const displayStatus = status === 'concluído' ? 'Concluído' : status;

    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || 'secondary'}
        className={`${colors[status as keyof typeof colors] || ''} border`}
      >
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{displayStatus}</span>
      </Badge>
    );
  };

  const getDocumentStats = useMemo(() => {
    const pendentes = documentos.filter(d => d.status === 'pendente').length;
    const processando = documentos.filter(d => d.status === 'processando').length;
    const concluidos = documentos.filter(d => d.status === 'concluído' || d.status === 'finalizado').length;
    const total = documentos.length;

    return {
      total,
      pendentes,
      processando,
      concluidos
    };
  }, [documentos]);

  if (clientsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cliente não encontrado</p>
          <Button 
            onClick={() => navigate('/gestao-clientes')}
            className="mt-4"
          >
            Voltar à Gestão de Clientes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/gestao-clientes')}
              className="border-blue-600/50 text-blue-400 hover:bg-blue-700/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {client.nome_completo}
              </h1>
              <p className="text-muted-foreground">
                Gestão de documentos e análises
              </p>
            </div>
          </div>
        </div>

        {/* Informações do Cliente */}
        <Card className="bg-slate-900/50 border-slate-700/50 mb-8">
          <CardHeader>
            <CardTitle className="text-slate-200">Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Documento</p>
                  <p className="font-medium text-slate-200">
                    {formatDocument(client.cpf_cnpj, client.tipo_pessoa)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">E-mail</p>
                  <p className="font-medium text-slate-200">{client.email || '-'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">WhatsApp</p>
                  <p className="font-medium text-slate-200">
                    {client.whatsapp ? formatPhone(client.whatsapp) : '-'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Nome Completo Prefeito</p>
                  <p className="font-medium text-slate-200">{client.nome_completo_prefeito || '-'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Instagram className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Instagram Prefeitura</p>
                  <p className="font-medium text-slate-200">{client.instagram_prefeitura || '-'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Instagram className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Instagram Prefeito</p>
                  <p className="font-medium text-slate-200">{client.instagram_prefeito || '-'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Documentos */}
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200">
              Documentos Analisados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {docsLoading ? (
              <p className="text-slate-400">Carregando documentos...</p>
            ) : documentos.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">Nenhum documento encontrado</p>
                <p className="text-slate-500 text-sm">
                  Faça upload de documentos para começar as análises
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documentos.map((documento) => (
                  <div
                    key={documento.id}
                    className="flex items-center justify-between p-4 border border-slate-700/50 rounded-lg bg-slate-800/20 hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-200">
                            {documento.nome_arquivo}
                          </p>
                          <p className="text-sm text-slate-400">
                            {documento.tipo_arquivo} • {documento.nome_cliente || 'Cliente não identificado'} • Enviado em{' '}
                            {new Date(documento.data_upload).toLocaleDateString('pt-BR')}
                          </p>
                          {documento.data_finalizacao && documento.status === 'concluído' && (
                            <p className="text-xs text-green-400 flex items-center mt-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Concluído em {new Date(documento.data_finalizacao).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(documento.data_finalizacao).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          )}
                          {documento.google_drive_url && (
                            <p className="text-xs text-green-400 flex items-center mt-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Salvo no Google Drive
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(documento.status)}
                      
                      {/* Botão Google Drive */}
                      {documento.google_drive_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(documento.google_drive_url!, '_blank', 'noopener,noreferrer')}
                          className="flex items-center space-x-1 border-green-600/50 hover:bg-green-700/20 text-green-400 hover:text-green-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Google Drive</span>
                        </Button>
                      )}
                      
                      {/* Botão Baixar Plano */}
                      {(documento.status === 'concluído' || documento.status === 'finalizado') && documento.url_plano && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadPlano(documento)}
                          className="flex items-center space-x-1 border-blue-600/50 hover:bg-blue-700/20 text-blue-400 hover:text-blue-300"
                        >
                          <Download className="w-4 h-4" />
                          <span>Baixar Plano</span>
                        </Button>
                      )}

                      {/* Botão Baixar Análise */}
                      {(documento.status === 'concluído' || documento.status === 'finalizado') && documento.url_analise && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadAnalise(documento)}
                          className="flex items-center space-x-1 border-green-600/50 hover:bg-green-700/20 text-green-400 hover:text-green-300"
                        >
                          <Download className="w-4 h-4" />
                          <span>Baixar Análise</span>
                        </Button>
                      )}
                      
                      {/* Botão Deletar */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center space-x-1 border-red-600/50 hover:bg-red-700/20 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Deletar</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-900 border-slate-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-slate-200">
                              Confirmar exclusão
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              Tem certeza que deseja deletar o documento "{documento.nome_arquivo}" do cliente {documento.nome_cliente}? 
                              Esta ação não pode ser desfeita e o arquivo será removido permanentemente do Supabase
                              {documento.google_drive_url ? ' (o arquivo permanecerá no Google Drive)' : ''}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteDocument(documento)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Relatórios de Análises de Sentimento */}
        <Card className="bg-slate-900/50 border-slate-700/50 mt-8">
          <CardHeader>
            <CardTitle className="text-slate-200">
              Relatórios de Análises de Sentimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!client?.instagram_prefeitura && !client?.instagram_prefeito ? (
              <div className="text-center py-8">
                <Instagram className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">Instagram não cadastrado</p>
                <p className="text-slate-500 text-sm">
                  Cadastre pelo menos um Instagram (prefeito ou prefeitura) para visualizar os relatórios
                </p>
              </div>
            ) : relatoriosLoading ? (
              <p className="text-slate-400">Carregando relatórios...</p>
            ) : (relatoriosInstagram.length === 0 && relatoriosPrefeito.length === 0 && relatoriosWeb.length === 0 && relatoriosQualitativo.length === 0) ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">Nenhum relatório encontrado</p>
                <p className="text-slate-500 text-sm">
                  Ainda não há relatórios de análise de sentimento para este perfil
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Relatórios Instagram por perfil */}
                {relatoriosInstagram.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
                      <Instagram className="w-5 h-5 text-pink-400" />
                      <span>Relatórios Instagram</span>
                    </h4>
                    
                    {/* Instagram Prefeitura */}
                    {relatoriosInstagram.filter(r => r.profile === client?.instagram_prefeitura).length > 0 && (
                      <div className="space-y-3">
                        <h5 className="text-md font-medium text-slate-300 flex items-center space-x-2 ml-4">
                          <Badge variant="secondary" className="bg-pink-900/20 text-pink-300 border-pink-700">
                            Prefeitura
                          </Badge>
                        </h5>
                        {relatoriosInstagram
                          .filter(r => r.profile === client?.instagram_prefeitura)
                          .map((relatorio) => (
                            <div
                              key={relatorio.id}
                              className="flex items-center justify-between p-4 border border-slate-700/50 rounded-lg bg-slate-800/20 hover:bg-slate-800/40 transition-colors ml-4"
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <Instagram className="w-5 h-5 text-pink-400" />
                                  <div>
                                    <p className="font-medium text-slate-200">
                                      Relatório da Análise de Sentimento do Instagram
                                    </p>
                                    <p className="text-sm text-slate-400">
                                      PDF • {client.nome_completo} • Criado em{' '}
                                      {new Date(relatorio.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                    <p className="text-xs text-green-400 flex items-center mt-1">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Concluído em {new Date(relatorio.created_at).toLocaleDateString('pt-BR')} às{' '}
                                      {new Date(relatorio.created_at).toLocaleTimeString('pt-BR', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <Badge className="bg-green-900/20 text-green-300 border-green-700 border">
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                  <span className="ml-1">Concluído</span>
                                </Badge>
                                
                                {relatorio.link_relatorio && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => downloadRelatorio(relatorio)}
                                    className="flex items-center space-x-1 border-green-600/50 hover:bg-green-700/20 text-green-400 hover:text-green-300"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>Baixar Relatório</span>
                                  </Button>
                                )}
                                
                                {relatorio.link_analise && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(relatorio.link_analise, '_blank')}
                                    className="flex items-center space-x-1 border-blue-600/50 hover:bg-blue-700/20 text-blue-400 hover:text-blue-300"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>Baixar Análise</span>
                                  </Button>
                                )}
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex items-center space-x-1 border-red-600/50 hover:bg-red-700/20 text-red-400 hover:text-red-300"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span>Deletar</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-slate-900 border-slate-700">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-slate-200">
                                        Confirmar exclusão
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-slate-400">
                                        Tem certeza que deseja deletar este relatório de análise de sentimento do Instagram? 
                                        Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteRelatorioInstagram(relatorio)}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        Deletar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                    
                    {/* Instagram Prefeito */}
                    {relatoriosInstagram.filter(r => r.profile === client?.instagram_prefeito).length > 0 && (
                      <div className="space-y-3">
                        <h5 className="text-md font-medium text-slate-300 flex items-center space-x-2 ml-4">
                          <Badge variant="secondary" className="bg-blue-900/20 text-blue-300 border-blue-700">
                            Prefeito
                          </Badge>
                          <span className="text-sm text-slate-400">@{client?.instagram_prefeito}</span>
                        </h5>
                        {relatoriosInstagram
                          .filter(r => r.profile === client?.instagram_prefeito)
                          .map((relatorio) => (
                            <div
                              key={relatorio.id}
                              className="flex items-center justify-between p-4 border border-slate-700/50 rounded-lg bg-slate-800/20 hover:bg-slate-800/40 transition-colors ml-4"
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <Instagram className="w-5 h-5 text-pink-400" />
                                  <div>
                                    <p className="font-medium text-slate-200">
                                      Relatório da Análise de Sentimento do Instagram
                                    </p>
                                    <p className="text-sm text-slate-400">
                                      PDF • {client.nome_completo} • Criado em{' '}
                                      {new Date(relatorio.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                    <p className="text-xs text-green-400 flex items-center mt-1">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Concluído em {new Date(relatorio.created_at).toLocaleDateString('pt-BR')} às{' '}
                                      {new Date(relatorio.created_at).toLocaleTimeString('pt-BR', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <Badge className="bg-green-900/20 text-green-300 border-green-700 border">
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                  <span className="ml-1">Concluído</span>
                                </Badge>
                                
                                {relatorio.link_relatorio && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => downloadRelatorio(relatorio)}
                                    className="flex items-center space-x-1 border-green-600/50 hover:bg-green-700/20 text-green-400 hover:text-green-300"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>Baixar Relatório</span>
                                  </Button>
                                )}
                                
                                {relatorio.link_analise && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(relatorio.link_analise, '_blank')}
                                    className="flex items-center space-x-1 border-blue-600/50 hover:bg-blue-700/20 text-blue-400 hover:text-blue-300"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>Baixar Análise</span>
                                  </Button>
                                )}
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex items-center space-x-1 border-red-600/50 hover:bg-red-700/20 text-red-400 hover:text-red-300"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span>Deletar</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-slate-900 border-slate-700">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-slate-200">
                                        Confirmar exclusão
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-slate-400">
                                        Tem certeza que deseja deletar este relatório de análise de sentimento do Instagram? 
                                        Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteRelatorioInstagram(relatorio)}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        Deletar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Relatórios Web por perfil */}
                {relatoriosWeb.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-blue-400" />
                      <span>Relatórios Web</span>
                    </h4>
                    
                    {/* Web Prefeitura */}
                    {relatoriosWeb.filter(r => r.profile === client?.instagram_prefeitura).length > 0 && (
                      <div className="space-y-3">
                        <h5 className="text-md font-medium text-slate-300 flex items-center space-x-2 ml-4">
                          <Badge variant="secondary" className="bg-pink-900/20 text-pink-300 border-pink-700">
                            Prefeitura
                          </Badge>
                        </h5>
                        {relatoriosWeb
                          .filter(r => r.profile === client?.instagram_prefeitura)
                          .map((relatorio) => (
                            <div
                              key={relatorio.id}
                              className="flex items-center justify-between p-4 border border-slate-700/50 rounded-lg bg-slate-800/20 hover:bg-slate-800/40 transition-colors ml-4"
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <Globe className="w-5 h-5 text-blue-400" />
                                  <div>
                                    <p className="font-medium text-slate-200">
                                      Relatório de Análise Web
                                    </p>
                                    <p className="text-sm text-slate-400">
                                      PDF • {client.nome_completo} • Criado em{' '}
                                      {new Date(relatorio.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                    <p className="text-xs text-green-400 flex items-center mt-1">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Concluído em {new Date(relatorio.created_at).toLocaleDateString('pt-BR')} às{' '}
                                      {new Date(relatorio.created_at).toLocaleTimeString('pt-BR', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <Badge className="bg-green-900/20 text-green-300 border-green-700 border">
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                  <span className="ml-1">Concluído</span>
                                </Badge>
                                
                                {relatorio.link_relatorio && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => downloadRelatorio(relatorio)}
                                    className="flex items-center space-x-1 border-green-600/50 hover:bg-green-700/20 text-green-400 hover:text-green-300"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>Baixar</span>
                                  </Button>
                                )}
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex items-center space-x-1 border-red-600/50 hover:bg-red-700/20 text-red-400 hover:text-red-300"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span>Deletar</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-slate-900 border-slate-700">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-slate-200">
                                        Confirmar exclusão
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-slate-400">
                                        Tem certeza que deseja deletar este relatório de análise web? 
                                        Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteRelatorioWeb(relatorio)}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        Deletar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                    
                    {/* Web Prefeito */}
                    {relatoriosWeb.filter(r => r.profile === client?.instagram_prefeito).length > 0 && (
                      <div className="space-y-3">
                        <h5 className="text-md font-medium text-slate-300 flex items-center space-x-2 ml-4">
                          <Badge variant="secondary" className="bg-blue-900/20 text-blue-300 border-blue-700">
                            Prefeito
                          </Badge>
                          <span className="text-sm text-slate-400">@{client?.instagram_prefeito}</span>
                        </h5>
                        {relatoriosWeb
                          .filter(r => r.profile === client?.instagram_prefeito)
                          .map((relatorio) => (
                            <div
                              key={relatorio.id}
                              className="flex items-center justify-between p-4 border border-slate-700/50 rounded-lg bg-slate-800/20 hover:bg-slate-800/40 transition-colors ml-4"
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <Globe className="w-5 h-5 text-blue-400" />
                                  <div>
                                    <p className="font-medium text-slate-200">
                                      Relatório de Análise Web
                                    </p>
                                    <p className="text-sm text-slate-400">
                                      PDF • {client.nome_completo} • Criado em{' '}
                                      {new Date(relatorio.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                    <p className="text-xs text-green-400 flex items-center mt-1">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Concluído em {new Date(relatorio.created_at).toLocaleDateString('pt-BR')} às{' '}
                                      {new Date(relatorio.created_at).toLocaleTimeString('pt-BR', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <Badge className="bg-green-900/20 text-green-300 border-green-700 border">
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                  <span className="ml-1">Concluído</span>
                                </Badge>
                                
                                {relatorio.link_relatorio && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => downloadRelatorio(relatorio)}
                                    className="flex items-center space-x-1 border-green-600/50 hover:bg-green-700/20 text-green-400 hover:text-green-300"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>Baixar Relatório</span>
                                  </Button>
                                )}
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex items-center space-x-1 border-red-600/50 hover:bg-red-700/20 text-red-400 hover:text-red-300"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span>Deletar</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-slate-900 border-slate-700">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-slate-200">
                                        Confirmar exclusão
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-slate-400">
                                        Tem certeza que deseja deletar este relatório de análise web? 
                                        Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteRelatorioWeb(relatorio)}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        Deletar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Relatórios Prefeito */}
                {relatoriosPrefeito.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      <span>Relatórios de Análise do Prefeito</span>
                    </h4>
                    {relatoriosPrefeito.map((relatorio) => (
                      <div
                        key={relatorio.id}
                        className="flex items-center justify-between p-4 border border-slate-700/50 rounded-lg bg-slate-800/20 hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Users className="w-5 h-5 text-blue-400" />
                            <div>
                              <p className="font-medium text-slate-200">
                                Relatório de Análise do Prefeito
                              </p>
                              <p className="text-sm text-slate-400">
                                PDF • {client.nome_completo} • Criado em{' '}
                                {new Date(relatorio.created_at).toLocaleDateString('pt-BR')}
                              </p>
                              <p className="text-xs text-green-400 flex items-center mt-1">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Concluído em {new Date(relatorio.created_at).toLocaleDateString('pt-BR')} às{' '}
                                {new Date(relatorio.created_at).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-green-900/20 text-green-300 border-green-700 border">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="ml-1">Concluído</span>
                          </Badge>
                          
                          {relatorio.link_relatorio && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadRelatorio(relatorio)}
                              className="flex items-center space-x-1 border-green-600/50 hover:bg-green-700/20 text-green-400 hover:text-green-300"
                            >
                              <Download className="w-4 h-4" />
                              <span>Baixar Relatório</span>
                            </Button>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center space-x-1 border-red-600/50 hover:bg-red-700/20 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Deletar</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-900 border-slate-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-slate-200">
                                  Confirmar exclusão
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                  Tem certeza que deseja deletar este relatório de análise do prefeito? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteRelatorioPrefeito(relatorio)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Relatórios Web */}
                {relatoriosWeb.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-green-400" />
                      <span>Relatórios de Análise Web</span>
                    </h4>
                    {relatoriosWeb.map((relatorio) => (
                      <div
                        key={relatorio.id}
                        className="flex items-center justify-between p-4 border border-slate-700/50 rounded-lg bg-slate-800/20 hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Globe className="w-5 h-5 text-green-400" />
                            <div>
                              <p className="font-medium text-slate-200">
                                Relatório de Análise Web
                              </p>
                              <p className="text-sm text-slate-400">
                                PDF • {client.nome_completo} • Criado em{' '}
                                {new Date(relatorio.created_at).toLocaleDateString('pt-BR')}
                              </p>
                              <p className="text-xs text-green-400 flex items-center mt-1">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Concluído em {new Date(relatorio.created_at).toLocaleDateString('pt-BR')} às{' '}
                                {new Date(relatorio.created_at).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-green-900/20 text-green-300 border-green-700 border">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="ml-1">Concluído</span>
                          </Badge>
                          
                          {relatorio.link_relatorio && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadRelatorio(relatorio)}
                              className="flex items-center space-x-1 border-green-600/50 hover:bg-green-700/20 text-green-400 hover:text-green-300"
                            >
                              <Download className="w-4 h-4" />
                              <span>Baixar Relatório</span>
                            </Button>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center space-x-1 border-red-600/50 hover:bg-red-700/20 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Deletar</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-900 border-slate-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-slate-200">
                                  Confirmar exclusão
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                  Tem certeza que deseja deletar este relatório de análise web? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteRelatorioWeb(relatorio)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Relatórios Qualitativos */}
                {relatoriosQualitativo.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
                      <BarChart className="w-5 h-5 text-purple-400" />
                      <span>Relatórios Qualitativos</span>
                    </h4>
                    {relatoriosQualitativo.map((relatorio) => (
                      <div
                        key={relatorio.id}
                        className="flex items-center justify-between p-4 border border-slate-700/50 rounded-lg bg-slate-800/20 hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <BarChart className="w-5 h-5 text-purple-400" />
                            <div>
                              <p className="font-medium text-slate-200">
                                Relatório Qualitativo
                              </p>
                              <p className="text-sm text-slate-400">
                                PDF • {client.nome_completo} • Criado em{' '}
                                {new Date(relatorio.created_at).toLocaleDateString('pt-BR')}
                              </p>
                              <p className="text-xs text-green-400 flex items-center mt-1">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Concluído em {new Date(relatorio.created_at).toLocaleDateString('pt-BR')} às{' '}
                                {new Date(relatorio.created_at).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-green-900/20 text-green-300 border-green-700 border">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="ml-1">Concluído</span>
                          </Badge>
                          
                          {relatorio.link_relatorio && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadRelatorio(relatorio)}
                              className="flex items-center space-x-1 border-green-600/50 hover:bg-green-700/20 text-green-400 hover:text-green-300"
                            >
                              <Download className="w-4 h-4" />
                              <span>Baixar Relatório</span>
                            </Button>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center space-x-1 border-red-600/50 hover:bg-red-700/20 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Deletar</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-900 border-slate-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-slate-200">
                                  Confirmar exclusão
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                  Tem certeza que deseja deletar este relatório qualitativo? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteRelatorioQualitativo(relatorio)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDetails;