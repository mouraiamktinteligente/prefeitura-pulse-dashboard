
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Upload, FileText, Download, Clock, CheckCircle, XCircle, AlertCircle, Trash2, ExternalLink } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useDocumentosAnalisados } from '@/hooks/useDocumentosAnalisados';
import { useToast } from '@/hooks/use-toast';

export const DocumentUpload = () => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { clients, loading: clientsLoading } = useClients();
  const { documentos, loading: docsLoading, fetchDocumentos, uploadDocument, deleteDocument, downloadAnalise } = useDocumentosAnalisados();
  const { toast } = useToast();

  const selectedClient = clients.find(client => client.id === selectedClientId);

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    fetchDocumentos(clientId);
  };

  const handleFileSelect = () => {
    if (!selectedClientId) {
      toast({
        title: "Selecione um cliente",
        description: "É necessário selecionar um cliente antes de fazer upload",
        variant: "destructive"
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedClientId || !selectedClient) return;

    // Validar tipo de arquivo
    const allowedTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato não suportado",
        description: "Apenas arquivos PDF, TXT e imagens (JPG, PNG) são aceitos",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 50MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    await uploadDocument(selectedClientId, file, selectedClient.nome_completo);
    setUploading(false);

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'processando':
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
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
      finalizado: 'default',
      erro: 'destructive'
    } as const;

    const colors = {
      pendente: 'bg-yellow-900/20 text-yellow-300 border-yellow-700',
      processando: 'bg-blue-900/20 text-blue-300 border-blue-700',
      finalizado: 'bg-green-900/20 text-green-300 border-green-700',
      erro: 'bg-red-900/20 text-red-300 border-red-700'
    };

    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || 'secondary'}
        className={`${colors[status as keyof typeof colors] || ''} border`}
      >
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-slate-200">
            <Upload className="w-5 h-5 text-blue-400" />
            <span>Upload de Documentos para Análise</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção de Cliente */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Selecionar Cliente
            </label>
            <Select onValueChange={handleClientSelect} value={selectedClientId}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-slate-200">
                <SelectValue placeholder="Escolha um cliente..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {clientsLoading ? (
                  <SelectItem value="loading" disabled>
                    Carregando clientes...
                  </SelectItem>
                ) : (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.id} className="text-slate-200">
                      {client.nome_completo}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Campo de Upload */}
          {selectedClientId && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Enviar Documento
              </label>
              <div className="border-2 border-dashed border-slate-600/50 rounded-lg p-6 text-center bg-slate-800/20">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">
                  Formatos aceitos: PDF, TXT, JPG, PNG (máx. 50MB)
                </p>
                <p className="text-slate-500 text-sm mb-4">
                  O arquivo será salvo automaticamente no Google Drive na pasta do cliente
                </p>
                <Button 
                  onClick={handleFileSelect}
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      {selectedClient && (
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200">
              Documentos de {selectedClient.nome_completo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {docsLoading ? (
              <p className="text-slate-400">Carregando documentos...</p>
            ) : documentos.length === 0 ? (
              <p className="text-slate-400">Nenhum documento encontrado para este cliente.</p>
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
                          onClick={() => window.open(documento.google_drive_url!, '_blank')}
                          className="flex items-center space-x-1 border-green-600/50 hover:bg-green-700/20 text-green-400 hover:text-green-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Google Drive</span>
                        </Button>
                      )}
                      
                      {/* Botão Baixar Análise */}
                      {documento.status === 'finalizado' && documento.url_analise && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadAnalise(documento)}
                          className="flex items-center space-x-1 border-slate-600/50 hover:bg-slate-700/50 text-slate-300"
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
      )}
    </div>
  );
};
