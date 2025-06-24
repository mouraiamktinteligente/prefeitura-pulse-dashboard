
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
import { Shield, Search, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (logoutTime: string | null) => {
    if (logoutTime) {
      return <Badge variant="secondary">Offline</Badge>;
    }
    return <Badge className="bg-green-600">Online</Badge>;
  };

  const getUserAgent = (userAgent: string | null) => {
    if (!userAgent) return 'N/A';
    
    // Detectar navegador
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    
    return 'Outro';
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
