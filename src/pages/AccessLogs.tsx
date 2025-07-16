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
import { Shield, Search, RefreshCw, LogOut, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  const [paginatedLogs, setPaginatedLogs] = useState<AccessLog[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [disconnectingUser, setDisconnectingUser] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const ITEMS_PER_PAGE = 50;

  // Gerar anos disponíveis (últimos 5 anos)
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  // Meses em português
  const months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('logs_acesso')
        .select('*')
        .order('data_hora_login', { ascending: false });

      if (error) throw error;

      setLogs(data || []);
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

  // Real-time listener para atualizações de logs de acesso
  useEffect(() => {
    console.log('Configurando subscription realtime para logs de acesso...');

    const channel = supabase
      .channel('logs-acesso-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'logs_acesso'
        },
        (payload) => {
          console.log('📡 Novo log de acesso inserido:', payload);
          const newLog = payload.new as AccessLog;
          
          setLogs(prevLogs => [newLog, ...prevLogs]);
          
          toast({
            title: "Novo acesso registrado",
            description: `${newLog.email_usuario} fez login`,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'logs_acesso'
        },
        (payload) => {
          console.log('📡 Log de acesso atualizado:', payload);
          const updatedLog = payload.new as AccessLog;
          
          setLogs(prevLogs => 
            prevLogs.map(log => 
              log.id === updatedLog.id ? updatedLog : log
            )
          );
          
          // Se o log foi atualizado com logout, mostrar notificação
          if (updatedLog.data_hora_logout) {
            toast({
              title: "Usuário desconectado",
              description: `${updatedLog.email_usuario} foi desconectado`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Removendo subscription realtime de logs de acesso...');
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Filtrar logs com base nos critérios
  useEffect(() => {
    let filtered = [...logs];

    // Filtro por email
    if (searchEmail) {
      filtered = filtered.filter(log => 
        log.email_usuario.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    // Filtro por mês e ano
    if (selectedMonth || selectedYear) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.data_hora_login);
        const logMonth = String(logDate.getMonth() + 1).padStart(2, '0');
        const logYear = String(logDate.getFullYear());

        const monthMatch = !selectedMonth || logMonth === selectedMonth;
        const yearMatch = !selectedYear || logYear === selectedYear;

        return monthMatch && yearMatch;
      });
    }

    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset para primeira página quando filtrar
  }, [searchEmail, selectedMonth, selectedYear, logs]);

  // Paginação
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedLogs(filteredLogs.slice(startIndex, endIndex));
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

  const clearFilters = () => {
    setSearchEmail('');
    setSelectedMonth('');
    setSelectedYear('');
    setCurrentPage(1);
  };

  // Função para obter data/hora no timezone de São Paulo para desconexão
  const getBrazilDateTime = (): string => {
    const now = new Date();
    // Usar o método correto para converter para o timezone de São Paulo
    const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
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
    // Formatar corretamente para o timezone de São Paulo
    return new Date(dateString).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
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
            <CardTitle className="text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Filtros</span>
            </CardTitle>
            <CardDescription className="text-blue-300">
              Filtre os logs por email, mês ou ano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-10 bg-blue-900/50 border-blue-600/50 text-white placeholder:text-blue-400"
                />
              </div>
              
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="bg-blue-900/50 border-blue-600/50 text-white">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-600">
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value} className="text-white hover:bg-blue-700">
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-blue-900/50 border-blue-600/50 text-white">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent className="bg-blue-800 border-blue-600">
                  {getAvailableYears().map((year) => (
                    <SelectItem key={year} value={String(year)} className="text-white hover:bg-blue-700">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex space-x-2">
                <Button
                  onClick={fetchLogs}
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-200 hover:bg-blue-700/50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recarregar
                </Button>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-red-600 text-red-200 hover:bg-red-700/50"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white">
              Histórico de Acessos ({filteredLogs.length} registros)
            </CardTitle>
            <CardDescription className="text-blue-300">
              Página {currentPage} de {totalPages} • Mostrando {paginatedLogs.length} de {filteredLogs.length} registros
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-white">Carregando...</div>
            ) : (
              <>
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
                      {paginatedLogs.map((log) => (
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
                  
                  {paginatedLogs.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-blue-300">
                      Nenhum log de acesso encontrado com os filtros aplicados
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                            className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} text-white hover:bg-blue-700/50`}
                          />
                        </PaginationItem>
                        
                        {/* Mostrar algumas páginas ao redor da página atual */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNumber = Math.max(1, currentPage - 2) + i;
                          if (pageNumber > totalPages) return null;
                          
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(pageNumber);
                                }}
                                isActive={currentPage === pageNumber}
                                className={`${
                                  currentPage === pageNumber 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-blue-200 hover:bg-blue-700/50'
                                }`}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                            }}
                            className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} text-white hover:bg-blue-700/50`}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessLogs;
