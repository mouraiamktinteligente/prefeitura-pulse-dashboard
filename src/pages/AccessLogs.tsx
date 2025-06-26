import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Search, RefreshCw, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AccessLog {
  id: string;
  email_usuario: string;
  data_hora_login: string;
  data_hora_logout: string | null;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
}

const AccessLogs = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AccessLog[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [disconnectingUser, setDisconnectingUser] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('logs_acesso')
        .select('*')
        .order('data_hora_login', { ascending: false });

      if (error) throw error;

      setLogs(data || []);
      setFilteredLogs(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar logs de acesso: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (searchEmail) {
      const filtered = logs.filter(log => 
        log.email_usuario.toLowerCase().includes(searchEmail.toLowerCase())
      );
      setFilteredLogs(filtered);
    } else {
      setFilteredLogs(logs);
    }
  }, [searchEmail, logs]);

  // Função para obter data/hora no timezone de São Paulo para desconexão
  const getBrazilDateTime = (): string => {
    const now = new Date();
    // Converte para o timezone de São Paulo (UTC-3)
    const brazilTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    return brazilTime.toISOString();
  };

  const handleDisconnectUser = async (logId: string, email: string) => {
    setDisconnectingUser(logId);
    
    try {
      const brazilDateTime = getBrazilDateTime();
      
      // Atualizar o log para marcar como desconectado
      const { error } = await supabase
        .from('logs_acesso')
        .update({ 
          data_hora_logout: brazilDateTime,
          updated_at: brazilDateTime
        })
        .eq('id', logId);

      if (error) throw error;

      // Se o usuário sendo desconectado é o próprio usuário logado, fazer logout
      if (email === user?.email) {
        toast({
          title: "Usuário desconectado",
          description: "Você foi desconectado da plataforma.",
        });
        
        // Pequeno delay para mostrar o toast antes do logout
        setTimeout(() => {
          logout();
        }, 1000);
      } else {
        // Atualizar a lista local
        setLogs(prevLogs => 
          prevLogs.map(log => 
            log.id === logId 
              ? { ...log, data_hora_logout: brazilDateTime }
              : log
          )
        );

        toast({
          title: "Usuário desconectado",
          description: `O usuário ${email} foi desconectado com sucesso.`,
        });
      }

    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao desconectar usuário: " + error.message,
        variant: "destructive"
      });
    } finally {
      setDisconnectingUser(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    // Como agora salvamos já no timezone do Brasil, apenas formatamos para exibir
    return new Date(dateString).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    });
  };

  const getStatusBadge = (logoutTime: string | null) => {
    if (logoutTime) {
      return <Badge variant="secondary">Offline</Badge>;
    }
    return <Badge className="bg-green-600">Online</Badge>;
  };

  const getUserAgent = (userAgent: string | null) => {
    if (!userAgent) return 'N/A';
    
    // Agora apenas retorna o valor salvo, pois já está sendo salvo corretamente
    return userAgent;
  };

  return (
    <div className="min-h-screen bg-blue-900 p-4">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Logs de Acesso</h1>
            <p className="text-blue-300">Controle e auditoria de acessos à plataforma</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white">Filtros</CardTitle>
            <CardDescription className="text-blue-300">
              Filtre os logs por email ou período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="pl-10 bg-blue-900/50 border-blue-600/50 text-white placeholder:text-blue-400"
                  />
                </div>
              </div>
              <Button
                onClick={fetchLogs}
                variant="outline"
                className="border-blue-600 text-blue-200 hover:bg-blue-700/50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white">
              Histórico de Acessos ({filteredLogs.length} registros)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-white">Carregando...</div>
            ) : (
              <div className="rounded-md border border-blue-700/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-700/50">
                      <TableHead className="text-blue-100">Email</TableHead>
                      <TableHead className="text-blue-100">Data/Hora Login</TableHead>
                      <TableHead className="text-blue-100">Data/Hora Logout</TableHead>
                      <TableHead className="text-blue-100">Status</TableHead>
                      <TableHead className="text-blue-100">IP</TableHead>
                      <TableHead className="text-blue-100">Navegador</TableHead>
                      <TableHead className="text-blue-100">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className="border-blue-700/50 hover:bg-blue-700/25">
                        <TableCell className="text-white font-medium">
                          {log.email_usuario}
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {formatDateTime(log.data_hora_login)}
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {log.data_hora_logout ? formatDateTime(log.data_hora_logout) : '-'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(log.data_hora_logout)}
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {log.ip_address || 'N/A'}
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {getUserAgent(log.user_agent)}
                        </TableCell>
                        <TableCell>
                          {!log.data_hora_logout ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={disconnectingUser === log.id}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  <LogOut className="w-4 h-4 mr-1" />
                                  {disconnectingUser === log.id ? 'Desconectando...' : 'Desconectar'}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-blue-800 border-blue-700">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">
                                    Desconectar Usuário
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-blue-300">
                                    Tem certeza que deseja desconectar o usuário <strong>{log.email_usuario}</strong>? 
                                    {log.email_usuario === user?.email ? 
                                      ' Você será deslogado da plataforma.' : 
                                      ' Esta ação irá forçar o logout e o usuário precisará fazer login novamente.'
                                    }
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-blue-700 text-white hover:bg-blue-600 border-blue-600">
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDisconnectUser(log.id, log.email_usuario)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Desconectar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <span className="text-blue-400 text-sm">Offline</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredLogs.length === 0 && (
                  <div className="text-center py-8 text-blue-300">
                    Nenhum log de acesso encontrado
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

export default AccessLogs;
