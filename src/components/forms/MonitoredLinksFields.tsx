import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MonitoredLinksFieldsProps {
  links: string[];
  onLinksChange: (links: string[]) => void;
  variant?: 'default' | 'dark';
}

export const MonitoredLinksFields = ({ links, onLinksChange, variant = 'default' }: MonitoredLinksFieldsProps) => {
  const [currentLink, setCurrentLink] = useState('');
  const { toast } = useToast();
  
  const isDark = variant === 'dark';
  const inputClasses = isDark ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" : "";
  const labelClasses = isDark ? "text-white text-sm font-medium mb-2 block" : "";

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddLink = () => {
    console.log('handleAddLink called, current links:', links);
    
    if (!currentLink.trim()) {
      toast({
        title: "Erro",
        description: "Digite um link válido",
        variant: "destructive"
      });
      return;
    }

    const linkToAdd = currentLink.trim().toLowerCase().startsWith('http') 
      ? currentLink.trim() 
      : `https://${currentLink.trim()}`;

    if (!isValidUrl(linkToAdd)) {
      toast({
        title: "Erro",
        description: "O link inserido não é válido",
        variant: "destructive"
      });
      return;
    }

    if (links.includes(linkToAdd)) {
      toast({
        title: "Erro",
        description: "Este link já foi adicionado",
        variant: "destructive"
      });
      return;
    }

    const newLinks = [...links, linkToAdd];
    console.log('Adding link:', linkToAdd, 'New links array:', newLinks);
    onLinksChange(newLinks);
    setCurrentLink('');
    
    toast({
      title: "Link adicionado",
      description: "Link salvo na lista de monitoramento"
    });
  };

  const handleRemoveLink = (indexToRemove: number) => {
    const updatedLinks = links.filter((_, index) => index !== indexToRemove);
    onLinksChange(updatedLinks);
    
    toast({
      title: "Link removido",
      description: "Link removido da lista de monitoramento"
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLink();
    }
  };

  // Debug: Always show the links section to test rendering
  const showLinksSection = true; // Temporary for debugging

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : ''}`}>Link dos sites monitorados</h3>
      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Debug: {links.length} links no array</p>
      
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="monitored_link" className={labelClasses}>Adicionar link do site</Label>
          <Input
            id="monitored_link"
            value={currentLink}
            onChange={(e) => setCurrentLink(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite o link do site (ex: www.exemplo.com)"
            className={inputClasses}
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            onClick={handleAddLink}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="default"
          >
            <Plus className="w-4 h-4 mr-1" />
            Salvar
          </Button>
        </div>
      </div>

      {showLinksSection && (
        <div className="space-y-2">
          <Label className={labelClasses}>Links salvos ({links.length})</Label>
          {links.length === 0 ? (
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Nenhum link adicionado ainda</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {links.map((link, index) => (
                <div
                  key={`link-${index}-${link}`}
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <LinkIcon className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span className={`text-sm truncate ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {link}
                    </span>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      #{index + 1}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLink(index)}
                    className={`ml-2 flex-shrink-0 ${
                      isDark 
                        ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300' 
                        : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};