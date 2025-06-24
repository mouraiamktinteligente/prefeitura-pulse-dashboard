
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Eye, EyeOff, Mail, AlertCircle } from "lucide-react";

interface CreateAuthUserProps {
  onUserCreated?: () => void;
}

export const CreateAuthUser = ({ onUserCreated }: CreateAuthUserProps) => {
  const [email, setEmail] = useState('admin@sistema.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Criando usuário no Auth:', email);
      
      // Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      console.log('Resultado do signUp:', { data, error });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: "Informação",
            description: `Usuário ${email} já existe no sistema de autenticação. Você pode tentar fazer login diretamente.`,
            variant: "default"
          });
        } else {
          throw error;
        }
      } else if (data.user) {
        const needsConfirmation = !data.user.email_confirmed_at;
        
        toast({
          title: "Sucesso",
          description: needsConfirmation 
            ? `Usuário ${email} criado! ${needsConfirmation ? 'Verifique o email para confirmar a conta.' : 'Conta confirmada automaticamente.'}`
            : `Usuário ${email} criado e confirmado com sucesso!`,
        });
        
        console.log('Usuário criado com sucesso:', {
          id: data.user.id,
          email: data.user.email,
          confirmed: !needsConfirmation
        });
        
        // Limpar formulário apenas a senha
        setPassword('');
        
        // Notificar componente pai
        if (onUserCreated) {
          onUserCreated();
        }
      }
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-slate-800/90 border-slate-600/50 shadow-xl backdrop-blur-sm">
      <CardHeader className="bg-slate-700/60 text-slate-100 border-b border-slate-600/50">
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-400" />
          Criar Usuário no Auth
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-200">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/50"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-200">
              Senha
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Senha (mín. 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-blue-100 focus:ring-blue-400/50 shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? "Criando..." : "Criar Usuário"}
          </Button>
        </form>
        
        <div className="mt-4 p-4 bg-amber-900/30 border border-amber-600/40 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-200 leading-relaxed">
              <p className="font-semibold mb-1">⚠️ Importante:</p>
              <p>
                Se o usuário já existir, você pode tentar fazer login diretamente. 
                O sistema verificará automaticamente se o usuário tem permissões no sistema.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
