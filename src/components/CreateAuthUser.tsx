
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Eye, EyeOff } from "lucide-react";

export const CreateAuthUser = () => {
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
      // Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: "Informação",
            description: "Usuário já existe no sistema de autenticação. Tente fazer login.",
            variant: "default"
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Sucesso",
          description: `Usuário ${email} criado com sucesso no sistema de autenticação!`,
        });
        
        // Limpar formulário
        setEmail('');
        setPassword('');
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
    <Card className="w-full max-w-md mx-auto bg-blue-800/60 border-blue-600/50 shadow-xl backdrop-blur-sm">
      <CardHeader className="bg-blue-700/60 text-blue-100 border-b border-blue-600/50">
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-300" />
          Criar Usuário no Auth
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-blue-200">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-blue-900/50 border-blue-600/50 text-blue-100 placeholder:text-blue-400 focus:border-blue-400 focus:ring-blue-400/50"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-blue-200">
              Senha
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Senha (mín. 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 bg-blue-900/50 border-blue-600/50 text-blue-100 placeholder:text-blue-400 focus:border-blue-400 focus:ring-blue-400/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
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
        
        <div className="mt-4 p-4 bg-blue-700/40 border border-blue-600/40 rounded-lg">
          <p className="text-sm text-blue-200 leading-relaxed">
            <strong className="text-blue-100">Nota:</strong> Este formulário cria usuários no sistema de autenticação do Supabase. 
            Certifique-se de que o usuário já existe na tabela usuarios_sistema.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
