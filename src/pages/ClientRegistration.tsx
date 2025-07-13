
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UserPlus, Edit, Trash2, Search, Instagram } from "lucide-react";
import { useClients, Cliente, ClienteInsert } from "@/hooks/useClients";
import { ClientForm } from "@/components/ClientForm";
import { formatCPF, formatCNPJ, formatPhone } from "@/utils/validation";
import { useNavigate } from "react-router-dom";

const ClientRegistration = () => {
  const { clients, loading, createClient, updateClient, deleteClient } = useClients();
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.cpf_cnpj.includes(searchTerm) ||
                         client.instagram?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleCreateClient = async (clientData: ClienteInsert) => {
    await createClient(clientData);
    setIsFormOpen(false);
  };

  const handleUpdateClient = async (clientData: ClienteInsert) => {
    if (selectedClient) {
      await updateClient(selectedClient.id, clientData);
      setSelectedClient(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    await deleteClient(clientId);
  };

  const formatDocument = (document: string, type: string) => {
    return type === 'fisica' ? formatCPF(document) : formatCNPJ(document);
  };

  return (
    <div className="min-h-screen bg-blue-900 p-4">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Gestão de Clientes</h1>
            <p className="text-blue-300">Gestão de clientes e análises de monitoramento</p>
          </div>
        </div>

        {/* Filtros */}
        <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome, e-mail, documento ou Instagram..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-blue-900/50 border-blue-600/50 text-white placeholder:text-blue-400"
                  />
                </div>
              </div>
              <Button
                onClick={() => {
                  setSelectedClient(null);
                  setIsFormOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Clientes */}
        <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white">
              Lista de Clientes ({filteredClients.length} clientes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-white">Carregando clientes...</div>
            ) : (
              <div className="rounded-md border border-blue-700/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-700/50">
                      <TableHead className="text-blue-100">Nome</TableHead>
                      <TableHead className="text-blue-100">Documento</TableHead>
                      <TableHead className="text-blue-100">E-mail</TableHead>
                      <TableHead className="text-blue-100">WhatsApp</TableHead>
                      <TableHead className="text-blue-100">Instagram</TableHead>
                      <TableHead className="text-blue-100">Status</TableHead>
                      <TableHead className="text-blue-100">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {filteredClients.map((client) => (
                       <TableRow 
                         key={client.id} 
                         className="border-blue-700/50 hover:bg-blue-700/25 cursor-pointer"
                         onClick={() => navigate(`/gestao-clientes/${client.id}`)}
                       >
                        <TableCell className="text-white">
                          <div>
                            <div className="font-medium">{client.nome_completo}</div>
                            {client.razao_social && (
                              <div className="text-sm text-blue-300">{client.razao_social}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {formatDocument(client.cpf_cnpj, client.tipo_pessoa)}
                        </TableCell>
                        <TableCell className="text-blue-200">{client.email || '-'}</TableCell>
                        <TableCell className="text-blue-200">
                          {client.whatsapp ? formatPhone(client.whatsapp) : '-'}
                        </TableCell>
                        <TableCell className="text-blue-200">
                          {client.instagram ? (
                            <div className="flex items-center gap-1">
                              <Instagram className="w-4 h-4" />
                              <span>{client.instagram}</span>
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={client.ativo ? 'default' : 'destructive'}>
                            {client.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                         <TableCell>
                           <div className="flex space-x-2">
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setSelectedClient(client);
                                 setIsFormOpen(true);
                               }}
                               className="border-blue-600 text-blue-200 hover:bg-blue-700/50"
                             >
                               <Edit className="w-4 h-4" />
                             </Button>
                             <AlertDialog>
                               <AlertDialogTrigger asChild>
                                 <Button 
                                   variant="outline" 
                                   size="sm"
                                   onClick={(e) => e.stopPropagation()}
                                   className="border-red-600 text-red-400 hover:bg-red-700/50"
                                 >
                                   <Trash2 className="w-4 h-4" />
                                 </Button>
                               </AlertDialogTrigger>
                              <AlertDialogContent className="bg-blue-800 border-blue-700">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription className="text-blue-300">
                                    Tem certeza que deseja excluir o cliente "{client.nome_completo}"?
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-blue-700 text-white hover:bg-blue-600">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteClient(client.id)}
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

            {filteredClients.length === 0 && !loading && (
              <div className="text-center py-8 text-blue-300">
                Nenhum cliente encontrado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog do Formulário */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-blue-800 border-blue-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {selectedClient ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <ClientForm
              client={selectedClient || undefined}
              onSubmit={selectedClient ? handleUpdateClient : handleCreateClient}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedClient(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ClientRegistration;
