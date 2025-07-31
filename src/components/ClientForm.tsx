
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, User } from "lucide-react";
import { validateCPF, validateCNPJ } from "@/utils/validation";
import { Cliente, ClienteInsert } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { PersonTypeSelector } from "./forms/PersonTypeSelector";
import { BasicInfoFields } from "./forms/BasicInfoFields";
import { ContactFields } from "./forms/ContactFields";
import { AddressFields } from "./forms/AddressFields";

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
    nome_completo_prefeito: client?.nome_completo_prefeito || '',
    instagram_prefeitura: client?.instagram_prefeitura || '',
    instagram_prefeito: client?.instagram_prefeito || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        nome_completo_prefeito: formData.nome_completo_prefeito || null,
        instagram_prefeitura: formData.instagram_prefeitura || null,
        instagram_prefeito: formData.instagram_prefeito || null,
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
          <PersonTypeSelector
            value={formData.tipo_pessoa}
            onChange={(value) => setFormData(prev => ({ ...prev, tipo_pessoa: value }))}
            variant="dark"
          />

          <BasicInfoFields
            tiposPessoa={formData.tipo_pessoa}
            nomeCompleto={formData.nome_completo}
            cpfCnpj={formData.cpf_cnpj}
            onNomeChange={(value) => setFormData(prev => ({ ...prev, nome_completo: value }))}
            onCpfCnpjChange={(value) => setFormData(prev => ({ ...prev, cpf_cnpj: value }))}
            variant="dark"
          />

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

          <ContactFields
            email={formData.email}
            whatsapp={formData.whatsapp}
            nome_completo_prefeito={formData.nome_completo_prefeito}
            instagram_prefeitura={formData.instagram_prefeitura}
            instagram_prefeito={formData.instagram_prefeito}
            onEmailChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
            onWhatsappChange={(value) => setFormData(prev => ({ ...prev, whatsapp: value }))}
            onNomeCompletoPrefeitoChange={(value) => setFormData(prev => ({ ...prev, nome_completo_prefeito: value }))}
            onInstagramPrefeituraChange={(value) => setFormData(prev => ({ ...prev, instagram_prefeitura: value }))}
            onInstagramPrefeitoChange={(value) => setFormData(prev => ({ ...prev, instagram_prefeito: value }))}
            variant="dark"
          />

          <AddressFields
            endereco={{
              cep: formData.endereco_cep,
              rua: formData.endereco_rua,
              numero: formData.endereco_numero,
              complemento: formData.endereco_complemento,
              bairro: formData.endereco_bairro,
              cidade: formData.endereco_cidade,
              estado: formData.endereco_estado
            }}
            onEnderecoChange={(field, value) => setFormData(prev => ({ ...prev, [`endereco_${field}`]: value }))}
            variant="dark"
          />

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
