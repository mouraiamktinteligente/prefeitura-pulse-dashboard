
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialugTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Crown, Users, Building, Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import { useUsers, UsuarioSistema } from "@/hooks/useUsers";
import { UserForm } from "@/components/UserForm";
import { formatCPF, formatCNPJ, formatPhone } from "@/utils/validation";

const UserManagement = () => {
  const { users, loading, createUser, updateUser, deleteUser } = useUsers();
  const [selectedUser, setSelectedUser] = useState<UsuarioSistema | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.cpf_cnpj.includes(searchTerm);
    
    const matchesFilter = filterType === 'all' || user.tipo_usuario === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleCreateUser = async (userData: Partial<UsuarioSistema>) => {
    await createUser(userData);
    setIsFormOpen(false);
  };

  const handleUpdateUser = async (userData: Partial<UsuarioSistema>) => {
    if (selectedUser) {
      await updateUser(selectedUser.id, userData);
      setSelectedUser(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'administrador':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'usuario':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'cliente':
        return <Building className="w-4 h-4 text-green-500" />;
    }
  };

  const getUserTypeBadge = (type: string) => {
    const variants = {
      administrador: 'default',
      usuario: 'secondary',
      cliente: 'outline'
    };
    
    const labels = {
      administrador: 'Admin',
      usuario: 'Usuário',
      cliente: 'Cliente'
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
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-blue-900">
                Gestão de Usuários
              </CardTitle>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedUser(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
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
          </CardHeader>
        </Card>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, e-mail ou documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="administrador">👑 Administradores</SelectItem>
                    <SelectItem value="usuario">👥 Usuários</SelectItem>
                    <SelectItem value="cliente">🏢 Clientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Usuários */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8">Carregando usuários...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {getUserTypeBadge(user.tipo_usuario)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.nome_completo}</div>
                          {user.razao_social && (
                            <div className="text-sm text-gray-500">{user.razao_social}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDocument(user.cpf_cnpj, user.tipo_pessoa)}
                      </TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>
                        {user.whatsapp ? formatPhone(user.whatsapp) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.ativo ? 'default' : 'destructive'}>
                          {user.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
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
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialugTitle>Confirmar exclusão</AlertDialugTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o usuário "{user.nome_completo}"?
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
            )}

            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                Nenhum usuário encontrado
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
