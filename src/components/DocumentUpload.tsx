
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Download, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useDocumentosAnalisados } from '@/hooks/useDocumentosAnalisados';
import { useToast } from '@/hooks/use-toast';

export const DocumentUpload = () => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { clients, loading: clientsLoading } = useClients();
  const { documentos, loading: docsLoading, fetchDocumentos, uploadDocument, downloadAnalise } = useDocumentosAnalisados();
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
    if (!file || !selectedClientId) return;

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
    await uploadDocument(selectedClientId, file);
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
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <Upload className="w-5 h-5 text-primary" />
            <span>Upload de Documentos para Análise</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção de Cliente */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Selecionar Cliente
            </label>
            <Select onValueChange={handleClientSelect} value={selectedClientId}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Escolha um cliente..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {clientsLoading ? (
                  <SelectItem value="loading" disabled>
                    Carregando clientes...
                  </SelectItem>
                ) : (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
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
              <label className="text-sm font-medium text-foreground">
                Enviar Documento
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/10">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Formatos aceitos: PDF, TXT, JPG, PNG (máx. 50MB)
                </p>
                <Button 
                  onClick={handleFileSelect}
                  disabled={uploading}
                  className="bg-primary hover:bg-primary/90"
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
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              Documentos de {selectedClient.nome_completo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {docsLoading ? (
              <p className="text-muted-foreground">Carregando documentos...</p>
            ) : documentos.length === 0 ? (
              <p className="text-muted-foreground">Nenhum documento encontrado para este cliente.</p>
            ) : (
              <div className="space-y-3">
                {documentos.map((documento) => (
                  <div
                    key={documento.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/5 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">
                            {documento.nome_arquivo}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {documento.tipo_arquivo} • Enviado em{' '}
                            {new Date(documento.data_upload).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(documento.status)}
                      
                      {documento.status === 'finalizado' && documento.url_analise && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadAnalise(documento)}
                          className="flex items-center space-x-1 border-border hover:bg-muted"
                        >
                          <Download className="w-4 h-4" />
                          <span>Baixar Análise</span>
                        </Button>
                      )}
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
