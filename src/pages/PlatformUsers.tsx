
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Crown, Users, Plus, Edit, Trash2, Search, Filter, LogOut, Circle } from "lucide-react";
import { useUsers, UsuarioSistema } from "@/hooks/useUsers";
import { UserForm } from "@/components/UserForm";
import { formatCPF, formatCNPJ, formatPhone } from "@/utils/validation";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useAuth } from "@/contexts/auth";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from '@/integrations/supabase/client';
import { RealtimeIndicator } from '@/components/RealtimeIndicator';

type UsuarioInsert = Database['public']['Tables']['usuarios_sistema']['Insert'];

const PlatformUsers = () => {
  const { users, loading, createUser, updateUser, deleteUser } = useUsers();
  const sessionManager = useSessionManager();
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<UsuarioSistema | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('platform');
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Filtrar apenas usuários da plataforma (admin e usuario)
  const platformUsers = users.filter(user => 
    user.tipo_usuario === 'administrador' || user.tipo_usuario === 'usuario'
  );

  const filteredUsers = platformUsers.filter(user => {
    const matchesSearch = user.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.cpf_cnpj.includes(searchTerm);
    
    const matchesFilter = filterType === 'platform' || user.tipo_usuario === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleCreateUser = async (userData: UsuarioInsert) => {
    // Garantir que só crie usuários da plataforma
    const platformUserData = {
      ...userData,
      tipo_usuario: userData.tipo_usuario === 'administrador' ? 'administrador' : 'usuario'
    } as UsuarioInsert;
    
    await createUser(platformUserData);
    setIsFormOpen(false);
  };

  const handleUpdateUser = async (userData: UsuarioInsert) => {
    if (selectedUser) {
      await updateUser(selectedUser.id, userData);
      setSelectedUser(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
  };

  const handleDisconnectUser = async (userEmail: string) => {
    setLoadingSessions(true);
    await sessionManager.disconnectUserByAdmin(userEmail, user?.email || 'admin');
    await loadActiveUsers();
    setLoadingSessions(false);
  };

  const loadActiveUsers = async () => {
    const activeSessions = await sessionManager.getActiveUsers();
    setActiveUsers(activeSessions);
  };

  const isUserOnline = (userEmail: string) => {
    return activeUsers.some(session => session.user_email === userEmail);
  };

  const getUserLastActivity = (userEmail: string) => {
    const session = activeUsers.find(s => s.user_email === userEmail);
    return session?.last_activity;
  };

  useEffect(() => {
    loadActiveUsers();
    
    // Intervalo menos frequente para evitar sobrecarga
    const interval = setInterval(loadActiveUsers, 60000); // Atualizar a cada 1 minuto

    let debounceTimeout: NodeJS.Timeout;

    // Realtime listener para sessões ativas (atualizar status online)
    const sessionChannel = supabase
      .channel('session-status-updates-platform')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sessoes_ativas'
      }, (payload) => {
        console.log('Session status changed:', payload);
        
        // Debounce para evitar múltiplas atualizações seguidas
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          loadActiveUsers(); // Recarregar status online dos usuários
        }, 2000);
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      clearTimeout(debounceTimeout);
      supabase.removeChannel(sessionChannel);
    };
  }, []);

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'administrador':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'usuario':
        return <Users className="w-4 h-4 text-blue-500" />;
    }
  };

  const getUserTypeBadge = (type: string) => {
    const variants = {
      administrador: 'default',
      usuario: 'secondary'
    };
    
    const labels = {
      administrador: 'Admin',
      usuario: 'Usuário'
    };

    return (
      <Badge variant={variants[type as keyof typeof variants] as any} className="flex items-center gap-1">
        {getUserTypeIcon(type)}
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  const formatDocument = (document: string, type: string) => {
    return type === 'fisica' ? formatCPF(document) : formatCNPJ(document);
  };

  return (
    <div className="min-h-screen bg-blue-900 p-4">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Usuários da Plataforma</h1>
              <p className="text-blue-300">Gestão de usuários administradores e operadores</p>
            </div>
          </div>
          <RealtimeIndicator showOnlineUsers className="hidden md:flex text-white" />
        </div>

        {/* Filtros */}
        <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome, e-mail ou documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-blue-900/50 border-blue-600/50 text-white placeholder:text-blue-400"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-blue-900/50 border-blue-600/50 text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-800 border-blue-700">
                    <SelectItem value="platform">Todos da plataforma</SelectItem>
                    <SelectItem value="administrador">👑 Administradores</SelectItem>
                    <SelectItem value="usuario">👥 Usuários</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Usuários */}
        <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white">
              Lista de Usuários ({filteredUsers.length} usuários)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-white">Carregando usuários...</div>
            ) : (
              <div className="rounded-md border border-blue-700/50 overflow-hidden">
                <Table>
                   <TableHeader>
                     <TableRow className="bg-blue-700/50">
                       <TableHead className="text-blue-100">Tipo</TableHead>
                       <TableHead className="text-blue-100">Nome</TableHead>
                       <TableHead className="text-blue-100">Documento</TableHead>
                       <TableHead className="text-blue-100">E-mail</TableHead>
                       <TableHead className="text-blue-100">WhatsApp</TableHead>
                       <TableHead className="text-blue-100">Status</TableHead>
                       <TableHead className="text-blue-100">Sessão</TableHead>
                       <TableHead className="text-blue-100">Ações</TableHead>
                     </TableRow>
                   </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-blue-700/50 hover:bg-blue-700/25">
                        <TableCell>
                          {getUserTypeBadge(user.tipo_usuario)}
                        </TableCell>
                        <TableCell className="text-white">
                          <div>
                            <div className="font-medium">{user.nome_completo}</div>
                            {user.razao_social && (
                              <div className="text-sm text-blue-300">{user.razao_social}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {formatDocument(user.cpf_cnpj, user.tipo_pessoa)}
                        </TableCell>
                        <TableCell className="text-blue-200">{user.email || '-'}</TableCell>
                        <TableCell className="text-blue-200">
                          {user.whatsapp ? formatPhone(user.whatsapp) : '-'}
                        </TableCell>
                         <TableCell>
                           <Badge variant={user.ativo ? 'default' : 'destructive'}>
                             {user.ativo ? 'Ativo' : 'Inativo'}
                           </Badge>
                         </TableCell>
                         <TableCell>
                           <div className="flex items-center gap-2">
                             <div className="flex items-center gap-1">
                               <Circle 
                                 className={`w-2 h-2 fill-current ${
                                   isUserOnline(user.email || '') ? 'text-green-500' : 'text-gray-500'
                                 }`} 
                               />
                               <span className={`text-xs ${
                                 isUserOnline(user.email || '') ? 'text-green-400' : 'text-gray-400'
                               }`}>
                                 {isUserOnline(user.email || '') ? 'Online' : 'Offline'}
                               </span>
                             </div>
                             {getUserLastActivity(user.email || '') && (
                               <span className="text-xs text-blue-300">
                                 {new Date(getUserLastActivity(user.email || '')).toLocaleString('pt-BR')}
                               </span>
                             )}
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="flex space-x-2">
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => {
                                 setSelectedUser(user);
                                 setIsFormOpen(true);
                               }}
                               className="border-blue-600 text-blue-200 hover:bg-blue-700/50"
                             >
                               <Edit className="w-4 h-4" />
                             </Button>
                             
                              {/* Botão de Desconectar - apenas se não for admin conectado desconectando outro admin */}
                              {isUserOnline(user.email || '') && 
                               !(user?.tipo_usuario === 'administrador' && user.tipo_usuario === 'administrador') && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      disabled={loadingSessions}
                                      className="border-orange-600 text-orange-400 hover:bg-orange-700/50"
                                    >
                                      <LogOut className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                 <AlertDialogContent className="bg-blue-800 border-blue-700">
                                   <AlertDialogHeader>
                                     <AlertDialogTitle className="text-white">Desconectar usuário</AlertDialogTitle>
                                     <AlertDialogDescription className="text-blue-300">
                                       Tem certeza que deseja desconectar "{user.nome_completo}"?
                                       O usuário será obrigado a fazer login novamente.
                                     </AlertDialogDescription>
                                   </AlertDialogHeader>
                                   <AlertDialogFooter>
                                     <AlertDialogCancel className="bg-blue-700 text-white hover:bg-blue-600">Cancelar</AlertDialogCancel>
                                     <AlertDialogAction
                                       onClick={() => handleDisconnectUser(user.email || '')}
                                       className="bg-orange-600 hover:bg-orange-700"
                                     >
                                       Desconectar
                                     </AlertDialogAction>
                                   </AlertDialogFooter>
                                 </AlertDialogContent>
                               </AlertDialog>
                             )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-red-600 text-red-400 hover:bg-red-700/50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-blue-800 border-blue-700">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription className="text-blue-300">
                                    Tem certeza que deseja excluir o usuário "{user.nome_completo}"?
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-blue-700 text-white hover:bg-blue-600">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-8 text-blue-300">
                Nenhum usuário encontrado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog do Formulário */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-blue-800 border-blue-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {selectedUser ? 'Editar Usuário' : 'Novo Usuário da Plataforma'}
              </DialogTitle>
            </DialogHeader>
            <UserForm
              user={selectedUser || undefined}
              onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedUser(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PlatformUsers;
