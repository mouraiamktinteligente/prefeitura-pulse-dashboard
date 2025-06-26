
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram } from "lucide-react";
import { formatPhone } from "@/utils/validation";

interface ContactFieldsProps {
  email: string;
  whatsapp: string;
  instagram: string;
  onEmailChange: (value: string) => void;
  onWhatsappChange: (value: string) => void;
  onInstagramChange: (value: string) => void;
  variant?: 'default' | 'dark';
}

export const ContactFields = ({ 
  email, 
  whatsapp, 
  instagram, 
  onEmailChange, 
  onWhatsappChange, 
  onInstagramChange,
  variant = 'default'
}: ContactFieldsProps) => {
  const isDark = variant === 'dark';
  const inputClasses = isDark ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" : "";
  const labelClasses = isDark ? "text-white text-sm font-medium mb-2 block" : "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <div>
        <Label htmlFor="instagram" className={labelClasses}>Instagram</Label>
        <div className="relative">
          <Instagram className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
          <Input
            id="instagram"
            value={instagram}
            onChange={(e) => onInstagramChange(e.target.value)}
            placeholder="@usuario"
            className={`pl-10 ${inputClasses}`}
          />
        </div>
      </div>
    </div>
  );
};
