
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Crown, Users, Building } from "lucide-react";
import { validateCPF, validateCNPJ, formatCPF, formatCNPJ, formatCEP, formatPhone, searchCEP } from "@/utils/validation";
import { UsuarioSistema } from "@/hooks/useUsers";
import { useToast } from "@/hooks/use-toast";

interface UserFormProps {
  user?: UsuarioSistema;
  onSubmit: (userData: Partial<UsuarioSistema>) => Promise<void>;
  onCancel: () => void;
}

const defaultPermissions = {
  acesso_dashboard: false,
  acesso_clientes: false,
  acesso_relatorios: false,
  acesso_financeiro: false,
  acesso_usuarios: false,
  acesso_logs: false
};

export const UserForm = ({ user, onSubmit, onCancel }: UserFormProps) => {
  const [formData, setFormData] = useState({
    tipo_usuario: user?.tipo_usuario || 'cliente',
    tipo_pessoa: user?.tipo_pessoa || 'fisica',
    nome_completo: user?.nome_completo || '',
    razao_social: user?.razao_social || '',
    nome_responsavel: user?.nome_responsavel || '',
    cpf_cnpj: user?.cpf_cnpj || '',
    email: user?.email || '',
    senha: '',
    whatsapp: user?.whatsapp || '',
    endereco_cep: user?.endereco_cep || '',
    endereco_rua: user?.endereco_rua || '',
    endereco_numero: user?.endereco_numero || '',
    endereco_complemento: user?.endereco_complemento || '',
    endereco_bairro: user?.endereco_bairro || '',
    endereco_cidade: user?.endereco_cidade || '',
    endereco_estado: user?.endereco_estado || '',
    permissoes: user?.permissoes || defaultPermissions,
    ativo: user?.ativo ?? true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const submitData: any = { ...formData };
      
      // Remover senha vazia em edições
      if (!submitData.senha) {
        delete submitData.senha;
      }
      
      // Hash da senha será feito no backend se necessário
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
      case 'cliente':
        return <Building className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getTypeIcon()}
          {user ? 'Editar' : 'Novo'} {formData.tipo_usuario === 'administrador' ? 'Administrador' : 
            formData.tipo_usuario === 'usuario' ? 'Usuário' : 'Cliente'}
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
                  <SelectItem value="cliente">🏢 Cliente</SelectItem>
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

          {/* Senha para Administrador e Usuário */}
          {(formData.tipo_usuario === 'administrador' || formData.tipo_usuario === 'usuario') && (
            <div>
              <Label htmlFor="senha">Senha {!user && '*'}</Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                required={!user}
                placeholder={user ? 'Deixe em branco para manter a atual' : ''}
              />
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

          {/* Permissões para Usuário Operacional */}
          {formData.tipo_usuario === 'usuario' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Permissões</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(defaultPermissions).map(([key, value]) => (
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
                    <Label htmlFor={key} className="text-sm">
                      {key.replace('acesso_', '').replace('_', ' ').toUpperCase()}
                    </Label>
                  </div>
                ))}
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
