
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/hooks/useUsers";
import { UserPlus, Instagram, Mail, Phone, MapPin, Building, User, FileText } from "lucide-react";
import { validateCPF, validateCNPJ, formatCPF, formatCNPJ, formatPhone } from "@/utils/validation";
import type { Database } from "@/integrations/supabase/types";

type UsuarioInsert = Database['public']['Tables']['usuarios_sistema']['Insert'];

const ClientRegistration = () => {
  const [formData, setFormData] = useState({
    tipo_pessoa: 'fisica' as 'fisica' | 'juridica',
    nome_completo: '',
    razao_social: '',
    nome_responsavel: '',
    cpf_cnpj: '',
    email: '',
    whatsapp: '',
    instagram: '',
    endereco_cep: '',
    endereco_rua: '',
    endereco_numero: '',
    endereco_complemento: '',
    endereco_bairro: '',
    endereco_cidade: '',
    endereco_estado: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const { createUser } = useUsers();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    if (field === 'cpf_cnpj') {
      // Aplicar formatação baseada no tipo de pessoa
      const formatted = formData.tipo_pessoa === 'fisica' 
        ? formatCPF(value) 
        : formatCNPJ(value);
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else if (field === 'whatsapp') {
      setFormData(prev => ({ ...prev, [field]: formatPhone(value) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.nome_completo.trim()) {
      toast({
        title: "Erro",
        description: "Nome completo é obrigatório.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.tipo_pessoa === 'juridica' && !formData.razao_social?.trim()) {
      toast({
        title: "Erro",
        description: "Razão social é obrigatória para pessoa jurídica.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.cpf_cnpj.trim()) {
      toast({
        title: "Erro",
        description: formData.tipo_pessoa === 'fisica' ? "CPF é obrigatório." : "CNPJ é obrigatório.",
        variant: "destructive"
      });
      return false;
    }

    // Validar CPF/CNPJ
    const isValid = formData.tipo_pessoa === 'fisica' 
      ? validateCPF(formData.cpf_cnpj)
      : validateCNPJ(formData.cpf_cnpj);
    
    if (!isValid) {
      toast({
        title: "Erro",
        description: formData.tipo_pessoa === 'fisica' ? "CPF inválido." : "CNPJ inválido.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Erro",
        description: "E-mail inválido.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const userData: UsuarioInsert = {
        tipo_usuario: 'cliente',
        tipo_pessoa: formData.tipo_pessoa,
        nome_completo: formData.nome_completo.trim(),
        razao_social: formData.razao_social?.trim() || null,
        nome_responsavel: formData.nome_responsavel?.trim() || null,
        cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''), // Remove formatação
        email: formData.email?.trim() || null,
        whatsapp: formData.whatsapp?.trim() || null,
        endereco_cep: formData.endereco_cep?.trim() || null,
        endereco_rua: formData.endereco_rua?.trim() || null,
        endereco_numero: formData.endereco_numero?.trim() || null,
        endereco_complemento: formData.endereco_complemento?.trim() || null,
        endereco_bairro: formData.endereco_bairro?.trim() || null,
        endereco_cidade: formData.endereco_cidade?.trim() || null,
        endereco_estado: formData.endereco_estado?.trim() || null,
        permissoes: JSON.stringify({ instagram: formData.instagram?.trim() || null }),
        ativo: true
      };

      await createUser(userData);
      
      // Limpar formulário
      setFormData({
        tipo_pessoa: 'fisica',
        nome_completo: '',
        razao_social: '',
        nome_responsavel: '',
        cpf_cnpj: '',
        email: '',
        whatsapp: '',
        instagram: '',
        endereco_cep: '',
        endereco_rua: '',
        endereco_numero: '',
        endereco_complemento: '',
        endereco_bairro: '',
        endereco_cidade: '',
        endereco_estado: ''
      });

    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              <UserPlus className="w-6 h-6" />
              Cadastro de Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Pessoa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Tipo de Pessoa *
                  </label>
                  <Select 
                    value={formData.tipo_pessoa} 
                    onValueChange={(value: 'fisica' | 'juridica') => {
                      setFormData(prev => ({ 
                        ...prev, 
                        tipo_pessoa: value,
                        cpf_cnpj: '', // Limpar documento ao trocar tipo
                        razao_social: '',
                        nome_responsavel: ''
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fisica">👤 Pessoa Física</SelectItem>
                      <SelectItem value="juridica">🏢 Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dados Pessoais/Empresariais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    <User className="w-4 h-4 inline mr-1" />
                    {formData.tipo_pessoa === 'fisica' ? 'Nome Completo *' : 'Nome do Responsável *'}
                  </label>
                  <Input
                    value={formData.nome_completo}
                    onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                    placeholder={formData.tipo_pessoa === 'fisica' ? 'João Silva' : 'João Silva (Responsável)'}
                    required
                  />
                </div>

                {formData.tipo_pessoa === 'juridica' && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      <Building className="w-4 h-4 inline mr-1" />
                      Razão Social *
                    </label>
                    <Input
                      value={formData.razao_social}
                      onChange={(e) => handleInputChange('razao_social', e.target.value)}
                      placeholder="Empresa LTDA"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Documento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    <FileText className="w-4 h-4 inline mr-1" />
                    {formData.tipo_pessoa === 'fisica' ? 'CPF *' : 'CNPJ *'}
                  </label>
                  <Input
                    value={formData.cpf_cnpj}
                    onChange={(e) => handleInputChange('cpf_cnpj', e.target.value)}
                    placeholder={formData.tipo_pessoa === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                    required
                  />
                </div>
              </div>

              {/* Contato */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    <Mail className="w-4 h-4 inline mr-1" />
                    E-mail
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="cliente@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    <Phone className="w-4 h-4 inline mr-1" />
                    WhatsApp
                  </label>
                  <Input
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    <Instagram className="w-4 h-4 inline mr-1" />
                    Instagram
                  </label>
                  <Input
                    value={formData.instagram}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    placeholder="@cliente_instagram"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Endereço (Opcional)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">CEP</label>
                    <Input
                      value={formData.endereco_cep}
                      onChange={(e) => handleInputChange('endereco_cep', e.target.value)}
                      placeholder="00000-000"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-slate-600">Rua</label>
                    <Input
                      value={formData.endereco_rua}
                      onChange={(e) => handleInputChange('endereco_rua', e.target.value)}
                      placeholder="Nome da rua"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Número</label>
                    <Input
                      value={formData.endereco_numero}
                      onChange={(e) => handleInputChange('endereco_numero', e.target.value)}
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Complemento</label>
                    <Input
                      value={formData.endereco_complemento}
                      onChange={(e) => handleInputChange('endereco_complemento', e.target.value)}
                      placeholder="Apto, sala, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Bairro</label>
                    <Input
                      value={formData.endereco_bairro}
                      onChange={(e) => handleInputChange('endereco_bairro', e.target.value)}
                      placeholder="Nome do bairro"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Cidade</label>
                    <Input
                      value={formData.endereco_cidade}
                      onChange={(e) => handleInputChange('endereco_cidade', e.target.value)}
                      placeholder="Nome da cidade"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Estado</label>
                    <Input
                      value={formData.endereco_estado}
                      onChange={(e) => handleInputChange('endereco_estado', e.target.value)}
                      placeholder="SP"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({
                    tipo_pessoa: 'fisica',
                    nome_completo: '',
                    razao_social: '',
                    nome_responsavel: '',
                    cpf_cnpj: '',
                    email: '',
                    whatsapp: '',
                    instagram: '',
                    endereco_cep: '',
                    endereco_rua: '',
                    endereco_numero: '',
                    endereco_complemento: '',
                    endereco_bairro: '',
                    endereco_cidade: '',
                    endereco_estado: ''
                  })}
                  disabled={isLoading}
                >
                  Limpar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Cadastrando..." : "Cadastrar Cliente"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientRegistration;
