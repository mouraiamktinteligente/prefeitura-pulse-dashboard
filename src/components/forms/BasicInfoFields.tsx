
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCPF, formatCNPJ } from "@/utils/validation";

interface BasicInfoFieldsProps {
  tiposPessoa: 'fisica' | 'juridica';
  nomeCompleto: string;
  cpfCnpj: string;
  onNomeChange: (value: string) => void;
  onCpfCnpjChange: (value: string) => void;
  variant?: 'default' | 'dark';
}

export const BasicInfoFields = ({ 
  tiposPessoa, 
  nomeCompleto, 
  cpfCnpj, 
  onNomeChange, 
  onCpfCnpjChange,
  variant = 'default'
}: BasicInfoFieldsProps) => {
  const isDark = variant === 'dark';
  const inputClasses = isDark ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" : "";
  const labelClasses = isDark ? "text-white text-sm font-medium mb-2 block" : "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="nome_completo" className={labelClasses}>
          {tiposPessoa === 'fisica' ? 'Nome Completo' : 'Nome Fantasia'}
        </Label>
        <Input
          id="nome_completo"
          value={nomeCompleto}
          onChange={(e) => onNomeChange(e.target.value)}
          required
          className={inputClasses}
        />
      </div>

      <div>
        <Label htmlFor="cpf_cnpj" className={labelClasses}>
          {tiposPessoa === 'fisica' ? 'CPF' : 'CNPJ'}
        </Label>
        <Input
          id="cpf_cnpj"
          value={cpfCnpj}
          onChange={(e) => {
            const formatted = tiposPessoa === 'fisica' 
              ? formatCPF(e.target.value)
              : formatCNPJ(e.target.value);
            onCpfCnpjChange(formatted);
          }}
          placeholder={tiposPessoa === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
          required
          className={inputClasses}
        />
      </div>
    </div>
  );
};
