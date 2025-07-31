
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram } from "lucide-react";
import { formatPhone } from "@/utils/validation";

interface ContactFieldsProps {
  email: string;
  whatsapp: string;
  nome_completo_prefeito: string;
  instagram_prefeitura: string;
  instagram_prefeito: string;
  onEmailChange: (value: string) => void;
  onWhatsappChange: (value: string) => void;
  onNomeCompletoPrefeitoChange: (value: string) => void;
  onInstagramPrefeituraChange: (value: string) => void;
  onInstagramPrefeitoChange: (value: string) => void;
  variant?: 'default' | 'dark';
}

export const ContactFields = ({ 
  email, 
  whatsapp, 
  nome_completo_prefeito,
  instagram_prefeitura,
  instagram_prefeito,
  onEmailChange, 
  onWhatsappChange, 
  onNomeCompletoPrefeitoChange,
  onInstagramPrefeituraChange,
  onInstagramPrefeitoChange,
  variant = 'default'
}: ContactFieldsProps) => {
  const isDark = variant === 'dark';
  const inputClasses = isDark ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" : "";
  const labelClasses = isDark ? "text-white text-sm font-medium mb-2 block" : "";

  return (
    <div className="space-y-4">
      {/* Primeira linha: Email e WhatsApp */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email" className={labelClasses}>E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <Label htmlFor="whatsapp" className={labelClasses}>WhatsApp</Label>
          <Input
            id="whatsapp"
            value={whatsapp}
            onChange={(e) => onWhatsappChange(formatPhone(e.target.value))}
            placeholder="(11) 99999-9999"
            className={inputClasses}
          />
        </div>
      </div>

      {/* Segunda linha: Nome completo do prefeito, Instagram Prefeitura e Instagram Prefeito */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="nome_completo_prefeito" className={labelClasses}>Nome Completo Prefeito</Label>
          <Input
            id="nome_completo_prefeito"
            value={nome_completo_prefeito}
            onChange={(e) => onNomeCompletoPrefeitoChange(e.target.value)}
            placeholder="Nome completo do prefeito"
            className={inputClasses}
          />
        </div>
        <div>
          <Label htmlFor="instagram_prefeitura" className={labelClasses}>Instagram Prefeitura</Label>
          <div className="relative">
            <Instagram className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            <Input
              id="instagram_prefeitura"
              value={instagram_prefeitura}
              onChange={(e) => onInstagramPrefeituraChange(e.target.value)}
              placeholder="@prefeitura"
              className={`pl-10 ${inputClasses}`}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="instagram_prefeito" className={labelClasses}>Instagram Prefeito</Label>
          <div className="relative">
            <Instagram className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            <Input
              id="instagram_prefeito"
              value={instagram_prefeito}
              onChange={(e) => onInstagramPrefeitoChange(e.target.value)}
              placeholder="@prefeito"
              className={`pl-10 ${inputClasses}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
