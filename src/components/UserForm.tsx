import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Crown, Users, Building, Eye, EyeOff, Globe, AlertCircle, Home, BarChart3, Megaphone, AlertTriangle, CheckSquare, UserPlus, Shield, FileText } from "lucide-react";
import { validateCPF, validateCNPJ, formatCPF, formatCNPJ, formatCEP, formatPhone, searchCEP } from "@/utils/validation";
import { UsuarioSistema } from "@/hooks/useUsers";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type UsuarioInsert = Database['public']['Tables']['usuarios_sistema']['Insert'];

interface UserFormProps {
  user?: UsuarioSistema;
  onSubmit: (userData: UsuarioInsert) => Promise<void>;
  onCancel: () => void;
}

const defaultPermissions = {
  acesso_dashboard: false,
  acesso_analise_pesquisa: false,
  acesso_marketing: false,
  acesso_alertas_crise: false,
  acesso_gestao_tarefas: false,
  acesso_clientes: false,
  acesso_usuarios: false,
  acesso_logs: false,
  acesso_movimentacoes: false
};

const permissionLabels: Record<string, string> = {
  acesso_dashboard: 'Dashboard',
  acesso_analise_pesquisa: 'Análise de Pesquisa',
  acesso_marketing: 'Marketing',
  acesso_alertas_crise: 'Alertas de Crise',
  acesso_gestao_tarefas: 'Gestão de Tarefas',
  acesso_clientes: 'Gestão de Clientes',
  acesso_usuarios: 'Usuários da Plataforma',
  acesso_logs: 'Logs de Acesso',
  acesso_movimentacoes: 'Registro de Movimentações'
};

const permissionIcons: Record<string, any> = {
  acesso_dashboard: Home,
  acesso_analise_pesquisa: BarChart3,
  acesso_marketing: Megaphone,
  acesso_alertas_crise: AlertTriangle,
  acesso_gestao_tarefas: CheckSquare,
  acesso_clientes: UserPlus,
  acesso_usuarios: Users,
  acesso_logs: Shield,
  acesso_movimentacoes: FileText
};

export const UserForm = ({ user, onSubmit, onCancel }: UserFormProps) => {
  const { clients } = useClients();
  const [formData, setFormData] = useState({
    tipo_usuario: user?.tipo_usuario || 'usuario' as const,
    tipo_pessoa: user?.tipo_pessoa || 'fisica' as const,
    nome_completo: user?.nome_completo || '',
    razao_social: user?.razao_social || '',
    nome_responsavel: user?.nome_responsavel || '',
    cpf_cnpj: user?.cpf_cnpj || '',
    email: user?.email || '',
    senha: '',
    whatsapp: user?.whatsapp || '',
    responsavel_alerta_crise: (user as any)?.responsavel_alerta_crise || '',
    whatsapp_responsavel_crise: (user as any)?.whatsapp_responsavel_crise || '',
    endereco_cep: user?.endereco_cep || '',
    endereco_rua: user?.endereco_rua || '',
    endereco_numero: user?.endereco_numero || '',
    endereco_complemento: user?.endereco_complemento || '',
    endereco_bairro: user?.endereco_bairro || '',
    endereco_cidade: user?.endereco_cidade || '',
    endereco_estado: user?.endereco_estado || '',
    permissoes: user?.permissoes || defaultPermissions,
    cliente_id: (user as any)?.cliente_id || null,
    ativo: user?.ativo ?? true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleCEPSearch = async (cep: string) => {
    if (cep.length === 9) {
      const addressData = await searchCEP(cep);
      if (addressData) {
        setFormData(prev => ({
          ...prev,
          endereco_rua: addressData.rua,
          endereco_bairro: addressData.bairro,
          endereco_cidade: addressData.cidade,
          endereco_estado: addressData.estado
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (formData.tipo_pessoa === 'fisica' && !validateCPF(formData.cpf_cnpj)) {
      toast({
        title: "Erro de validação",
        description: "CPF inválido",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.tipo_pessoa === 'juridica' && !validateCNPJ(formData.cpf_cnpj)) {
      toast({
        title: "Erro de validação",
        description: "CNPJ inválido",
        variant: "destructive"
      });
      return;
    }

    // Validação: Usuário operacional DEVE ter prefeitura
    if (formData.tipo_usuario === 'usuario' && !formData.cliente_id) {
      toast({
        title: "Erro de validação",
        description: "Usuários operacionais devem ter uma prefeitura vinculada",
        variant: "destructive"
      });
      return;
    }

    if ((formData.tipo_usuario === 'administrador' || formData.tipo_usuario === 'usuario') && !formData.email) {
      toast({
        title: "Erro de validação",
        description: "E-mail é obrigatório para administradores e usuários",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData: UsuarioInsert = {
        tipo_usuario: formData.tipo_usuario,
        tipo_pessoa: formData.tipo_pessoa,
        nome_completo: formData.nome_completo,
        cpf_cnpj: formData.cpf_cnpj,
        razao_social: formData.razao_social || null,
        nome_responsavel: formData.nome_responsavel || null,
        email: formData.email || null,
        whatsapp: formData.whatsapp || null,
        endereco_cep: formData.endereco_cep || null,
        endereco_rua: formData.endereco_rua || null,
        endereco_numero: formData.endereco_numero || null,
        endereco_complemento: formData.endereco_complemento || null,
        endereco_bairro: formData.endereco_bairro || null,
        endereco_cidade: formData.endereco_cidade || null,
        endereco_estado: formData.endereco_estado || null,
        permissoes: formData.permissoes,
        ativo: formData.ativo,
        cliente_id: formData.cliente_id
      };
      
      // Adicionar senha apenas se foi informada
      if (formData.senha) {
        submitData.senha_hash = formData.senha; // Em produção, isso seria hasheado no backend
      }
      
      await onSubmit(submitData);
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = () => {
    switch (formData.tipo_usuario) {
      case 'administrador':
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'usuario':
        return <Users className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getTypeIcon()}
          {user ? 'Editar' : 'Novo'} {formData.tipo_usuario === 'administrador' ? 'Administrador' : 'Usuário'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Usuário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo_usuario">Tipo de Usuário</Label>
              <Select value={formData.tipo_usuario} onValueChange={(value: any) => 
                setFormData(prev => ({ ...prev, tipo_usuario: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrador">👑 Administrador Master</SelectItem>
                  <SelectItem value="usuario">👥 Usuário Operacional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tipo_pessoa">Tipo de Pessoa</Label>
              <Select value={formData.tipo_pessoa} onValueChange={(value: any) => 
                setFormData(prev => ({ ...prev, tipo_pessoa: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fisica">Pessoa Física</SelectItem>
                  <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome_completo">
                {formData.tipo_pessoa === 'fisica' ? 'Nome Completo' : 'Nome Fantasia'}
              </Label>
              <Input
                id="nome_completo"
                value={formData.nome_completo}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="cpf_cnpj">
                {formData.tipo_pessoa === 'fisica' ? 'CPF' : 'CNPJ'}
              </Label>
              <Input
                id="cpf_cnpj"
                value={formData.cpf_cnpj}
                onChange={(e) => {
                  const formatted = formData.tipo_pessoa === 'fisica' 
                    ? formatCPF(e.target.value)
                    : formatCNPJ(e.target.value);
                  setFormData(prev => ({ ...prev, cpf_cnpj: formatted }));
                }}
                placeholder={formData.tipo_pessoa === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                required
              />
            </div>
          </div>

          {/* Campos específicos para Pessoa Jurídica */}
          {formData.tipo_pessoa === 'juridica' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="razao_social">Razão Social</Label>
                <Input
                  id="razao_social"
                  value={formData.razao_social}
                  onChange={(e) => setFormData(prev => ({ ...prev, razao_social: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nome_responsavel">Nome do Responsável</Label>
                <Input
                  id="nome_responsavel"
                  value={formData.nome_responsavel}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome_responsavel: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Contato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">E-mail {(formData.tipo_usuario === 'administrador' || formData.tipo_usuario === 'usuario') && '*'}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required={formData.tipo_usuario === 'administrador' || formData.tipo_usuario === 'usuario'}
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: formatPhone(e.target.value) }))}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {/* Responsável Alerta de Crise */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white border-b border-gray-700 pb-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold">Responsável por Alertas de Crise</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responsavel_alerta_crise">
                  Nome do Responsável
                </Label>
                <Input
                  id="responsavel_alerta_crise"
                  value={formData.responsavel_alerta_crise}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    responsavel_alerta_crise: e.target.value 
                  }))}
                  placeholder="Nome completo do responsável"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Pessoa designada para receber e gerenciar alertas críticos
                </p>
              </div>
              
              <div>
                <Label htmlFor="whatsapp_responsavel_crise">
                  WhatsApp do Responsável
                </Label>
                <Input
                  id="whatsapp_responsavel_crise"
                  value={formData.whatsapp_responsavel_crise}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    whatsapp_responsavel_crise: formatPhone(e.target.value) 
                  }))}
                  placeholder="(11) 99999-9999"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Contato direto para notificações urgentes
                </p>
              </div>
            </div>
          </div>

          {/* Senha para Administrador e Usuário */}
          {(formData.tipo_usuario === 'administrador' || formData.tipo_usuario === 'usuario') && (
            <div>
              <Label htmlFor="senha">Senha {!user && '*'}</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  value={formData.senha}
                  onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                  required={!user}
                  placeholder={user ? 'Deixe em branco para manter a atual' : ''}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="endereco_cep">CEP</Label>
                <Input
                  id="endereco_cep"
                  value={formData.endereco_cep}
                  onChange={(e) => {
                    const formatted = formatCEP(e.target.value);
                    setFormData(prev => ({ ...prev, endereco_cep: formatted }));
                    handleCEPSearch(formatted);
                  }}
                  placeholder="00000-000"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="endereco_rua">Rua</Label>
                <Input
                  id="endereco_rua"
                  value={formData.endereco_rua}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco_rua: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="endereco_numero">Número</Label>
                <Input
                  id="endereco_numero"
                  value={formData.endereco_numero}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco_numero: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endereco_complemento">Complemento</Label>
                <Input
                  id="endereco_complemento"
                  value={formData.endereco_complemento}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco_complemento: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endereco_bairro">Bairro</Label>
                <Input
                  id="endereco_bairro"
                  value={formData.endereco_bairro}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco_bairro: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endereco_cidade">Cidade</Label>
                <Input
                  id="endereco_cidade"
                  value={formData.endereco_cidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco_cidade: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="endereco_estado">Estado</Label>
              <Input
                id="endereco_estado"
                value={formData.endereco_estado}
                onChange={(e) => setFormData(prev => ({ ...prev, endereco_estado: e.target.value }))}
                maxLength={2}
                placeholder="SP"
              />
            </div>
          </div>

          {/* Campo Prefeitura Vinculada */}
          <div className="space-y-2">
            <Label htmlFor="cliente_id">
              Prefeitura Vinculada
              {formData.tipo_usuario === 'administrador' && (
                <span className="text-sm text-gray-500 ml-2">
                  (Deixe "Acesso Geral" para acesso a todas as prefeituras)
                </span>
              )}
            </Label>
            <Select 
              value={formData.cliente_id || 'geral'} 
              onValueChange={(value) => 
                setFormData(prev => ({ 
                  ...prev, 
                  cliente_id: value === 'geral' ? null : value 
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma prefeitura..." />
              </SelectTrigger>
              <SelectContent>
                {formData.tipo_usuario === 'administrador' && (
                  <SelectItem value="geral">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>🌐 Acesso Geral (Todas as Prefeituras)</span>
                    </div>
                  </SelectItem>
                )}
                {clients
                  .filter(c => c.ativo)
                  .sort((a, b) => a.nome_completo.localeCompare(b.nome_completo))
                  .map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nome_completo}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            
            {formData.tipo_usuario === 'usuario' && !formData.cliente_id && (
              <p className="text-sm text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Usuários operacionais devem ter uma prefeitura vinculada
              </p>
            )}
          </div>

          {/* Permissões para Usuário Operacional */}
          {formData.tipo_usuario === 'usuario' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Permissões</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(defaultPermissions).map(([key, value]) => {
                  const Icon = permissionIcons[key];
                  return (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={formData.permissoes[key] || false}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({
                            ...prev,
                            permissoes: { ...prev.permissoes, [key]: checked }
                          }))
                        }
                      />
                      {Icon && <Icon className="h-4 w-4 text-gray-400" />}
                      <Label htmlFor={key} className="text-sm cursor-pointer">
                        {permissionLabels[key] || key}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : user ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
