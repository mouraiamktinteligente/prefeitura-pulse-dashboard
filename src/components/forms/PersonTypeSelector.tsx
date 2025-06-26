
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PersonTypeSelectorProps {
  value: 'fisica' | 'juridica';
  onChange: (value: 'fisica' | 'juridica') => void;
  variant?: 'default' | 'dark';
}

export const PersonTypeSelector = ({ value, onChange, variant = 'default' }: PersonTypeSelectorProps) => {
  const isDark = variant === 'dark';

  return (
    <div>
      <Label htmlFor="tipo_pessoa" className={`text-sm font-medium mb-2 block ${isDark ? 'text-white' : ''}`}>
        Tipo de Pessoa
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={isDark ? "bg-slate-700 border-slate-600 text-white" : ""}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={isDark ? "bg-slate-800 border-slate-700" : ""}>
          <SelectItem value="fisica">👤 Pessoa Física</SelectItem>
          <SelectItem value="juridica">🏢 Pessoa Jurídica</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
