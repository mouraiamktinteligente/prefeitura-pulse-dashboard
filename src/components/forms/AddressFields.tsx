
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCEP, searchCEP } from "@/utils/validation";

interface AddressFieldsProps {
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  onEnderecoChange: (field: string, value: string) => void;
  variant?: 'default' | 'dark';
}

export const AddressFields = ({ endereco, onEnderecoChange, variant = 'default' }: AddressFieldsProps) => {
  const isDark = variant === 'dark';
  const inputClasses = isDark ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" : "";
  const labelClasses = isDark ? "text-white text-sm font-medium mb-2 block" : "";

  const handleCEPSearch = async (cep: string) => {
    if (cep.length === 9) {
      const addressData = await searchCEP(cep);
      if (addressData) {
        onEnderecoChange('rua', addressData.rua);
        onEnderecoChange('bairro', addressData.bairro);
        onEnderecoChange('cidade', addressData.cidade);
        onEnderecoChange('estado', addressData.estado);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : ''}`}>Endereço</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="endereco_cep" className={labelClasses}>CEP</Label>
          <Input
            id="endereco_cep"
            value={endereco.cep}
            onChange={(e) => {
              const formatted = formatCEP(e.target.value);
              onEnderecoChange('cep', formatted);
              handleCEPSearch(formatted);
            }}
            placeholder="00000-000"
            className={inputClasses}
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="endereco_rua" className={labelClasses}>Rua</Label>
          <Input
            id="endereco_rua"
            value={endereco.rua}
            onChange={(e) => onEnderecoChange('rua', e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="endereco_numero" className={labelClasses}>Número</Label>
          <Input
            id="endereco_numero"
            value={endereco.numero}
            onChange={(e) => onEnderecoChange('numero', e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <Label htmlFor="endereco_complemento" className={labelClasses}>Complemento</Label>
          <Input
            id="endereco_complemento"
            value={endereco.complemento}
            onChange={(e) => onEnderecoChange('complemento', e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <Label htmlFor="endereco_bairro" className={labelClasses}>Bairro</Label>
          <Input
            id="endereco_bairro"
            value={endereco.bairro}
            onChange={(e) => onEnderecoChange('bairro', e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <Label htmlFor="endereco_cidade" className={labelClasses}>Cidade</Label>
          <Input
            id="endereco_cidade"
            value={endereco.cidade}
            onChange={(e) => onEnderecoChange('cidade', e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="endereco_estado" className={labelClasses}>Estado</Label>
        <Input
          id="endereco_estado"
          value={endereco.estado}
          onChange={(e) => onEnderecoChange('estado', e.target.value)}
          maxLength={2}
          placeholder="SP"
          className={inputClasses}
        />
      </div>
    </div>
  );
};
