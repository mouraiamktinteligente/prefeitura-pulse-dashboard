
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, User, Instagram } from "lucide-react";
import { validateCPF, validateCNPJ, formatCPF, formatCNPJ, formatCEP, formatPhone, searchCEP } from "@/utils/validation";
import { Cliente, ClienteInsert } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

interface ClientFormProps {
  client?: Cliente;
  onSubmit: (clientData: ClienteInsert) => Promise<void>;
  onCancel: () => void;
}

export const ClientForm = ({ client, onSubmit, onCancel }: ClientFormProps) => {
  const [formData, setFormData] = useState({
    tipo_pessoa: client?.tipo_pessoa || 'fisica' as const,
    nome_completo: client?.nome_completo || '',
    razao_social: client?.razao_social || '',
    nome_responsavel: client?.nome_responsavel || '',
    cpf_cnpj: client?.cpf_cnpj || '',
    email: client?.email || '',
    whatsapp: client?.whatsapp || '',
    instagram: client?.instagram || '',
    endereco_cep: client?.endereco_cep || '',
    endereco_rua: client?.endereco_rua || '',
    endereco_numero: client?.endereco_numero || '',
    endereco_complemento: client?.endereco_complemento || '',
    endereco_bairro: client?.endereco_bairro || '',
    endereco_cidade: client?.endereco_cidade || '',
    endereco_estado: client?.endereco_estado || '',
    ativo: client?.ativo ?? true
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

    setIsSubmitting(true);
    try {
      const submitData: ClienteInsert = {
        tipo_pessoa: formData.tipo_pessoa,
        nome_completo: formData.nome_completo,
        cpf_cnpj: formData.cpf_cnpj,
        razao_social: formData.razao_social || null,
        nome_responsavel: formData.nome_responsavel || null,
        email: formData.email || null,
        whatsapp: formData.whatsapp || null,
        instagram: formData.instagram || null,
        endereco_cep: formData.endereco_cep || null,
        endereco_rua: formData.endereco_rua || null,
        endereco_numero: formData.endereco_numero || null,
        endereco_complemento: formData.endereco_complemento || null,
        endereco_bairro: formData.endereco_bairro || null,
        endereco_cidade: formData.endereco_cidade || null,
        endereco_estado: formData.endereco_estado || null,
        ativo: formData.ativo
      };
      
      await onSubmit(submitData);
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = () => {
    return formData.tipo_pessoa === 'fisica' ? 
      <User className="w-5 h-5 text-green-500" /> : 
      <Building className="w-5 h-5 text-blue-500" />;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-slate-800 border-slate-700">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white text-lg">
          {getTypeIcon()}
          Novo Cliente
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Pessoa */}
          <div>
            <Label htmlFor="tipo_pessoa" className="text-white text-sm font-medium mb-2 block">Tipo de Pessoa</Label>
            <Select value={formData.tipo_pessoa} onValueChange={(value: any) => 
              setFormData(prev => ({ ...prev, tipo_pessoa: value }))
            }>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="fisica">👤 Pessoa Física</SelectItem>
                <SelectItem value="juridica">🏢 Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome_completo" className="text-white text-sm font-medium mb-2 block">
                {formData.tipo_pessoa === 'fisica' ? 'Nome Completo' : 'Nome Fantasia'}
              </Label>
              <Input
                id="nome_completo"
                value={formData.nome_completo}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
                required
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <div>
              <Label htmlFor="cpf_cnpj" className="text-white text-sm font-medium mb-2 block">
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
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Campos específicos para Pessoa Jurídica */}
          {formData.tipo_pessoa === 'juridica' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="razao_social" className="text-white text-sm font-medium mb-2 block">Razão Social</Label>
                <Input
                  id="razao_social"
                  value={formData.razao_social}
                  onChange={(e) => setFormData(prev => ({ ...prev, razao_social: e.target.value }))}
                  required
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="nome_responsavel" className="text-white text-sm font-medium mb-2 block">Nome do Responsável</Label>
                <Input
                  id="nome_responsavel"
                  value={formData.nome_responsavel}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome_responsavel: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* Contato */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="email" className="text-white text-sm font-medium mb-2 block">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp" className="text-white text-sm font-medium mb-2 block">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: formatPhone(e.target.value) }))}
                placeholder="(11) 99999-9999"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div>
              <Label htmlFor="instagram" className="text-white text-sm font-medium mb-2 block">Instagram</Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                  placeholder="@usuario"
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="endereco_cep" className="text-white text-sm font-medium mb-2 block">CEP</Label>
                <Input
                  id="endereco_cep"
                  value={formData.endereco_cep}
                  onChange={(e) => {
                    const formatted = formatCEP(e.target.value);
                    setFormData(prev => ({ ...prev, endereco_cep: formatted }));
                    handleCEPSearch(formatted);
                  }}
                  placeholder="00000-000"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="endereco_rua" className="text-white text-sm font-medium mb-2 block">Rua</Label>
                <Input
                  id="endereco_rua"
                  value={formData.endereco_rua}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco_rua: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="endereco_numero" className="text-white text-sm font-medium mb-2 block">Número</Label>
                <Input
                  id="endereco_numero"
                  value={formData.endereco_numero}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco_numero: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="endereco_complemento" className="text-white text-sm font-medium mb-2 block">Complemento</Label>
                <Input
                  id="endereco_complemento"
                  value={formData.endereco_complemento}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco_complemento: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="endereco_bairro" className="text-white text-sm font-medium mb-2 block">Bairro</Label>
                <Input
                  id="endereco_bairro"
                  value={formData.endereco_bairro}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco_bairro: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="endereco_cidade" className="text-white text-sm font-medium mb-2 block">Cidade</Label>
                <Input
                  id="endereco_cidade"
                  value={formData.endereco_cidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco_cidade: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="endereco_estado" className="text-white text-sm font-medium mb-2 block">Estado</Label>
              <Input
                id="endereco_estado"
                value={formData.endereco_estado}
                onChange={(e) => setFormData(prev => ({ ...prev, endereco_estado: e.target.value }))}
                maxLength={2}
                placeholder="SP"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Salvando...' : client ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
