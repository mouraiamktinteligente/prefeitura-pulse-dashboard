
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, Settings, AlertCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Erro no login:', error);
        
        // Verificar tipos específicos de erro
        if (error.message?.includes('Email not confirmed') || 
            error.code === 'email_not_confirmed') {
          toast({
            title: "Email não confirmado",
            description: "Você precisa confirmar seu email antes de fazer login. Verifique sua caixa de entrada e spam.",
            variant: "destructive"
          });
        } else if (error.message?.includes('Invalid login credentials') || 
                   error.message?.includes('invalid_credentials')) {
          toast({
            title: "Credenciais inválidas",
            description: "E-mail ou senha incorretos. Verifique os dados e tente novamente.",
            variant: "destructive"
          });
        } else if (error.message?.includes('Usuário não encontrado')) {
          toast({
            title: "Usuário não encontrado",
            description: "Este usuário não está cadastrado no sistema. Entre em contato com o administrador.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro no login",
            description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl bg-slate-100/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800 mb-2">
            Moura IA Marketing
          </CardTitle>
          <p className="text-slate-600 text-lg">Faça login em sua conta</p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-white/80 border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-12 h-12 bg-white/80 border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base shadow-lg transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-8 space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold">Problema no login?</p>
                  <p>Se você criou a conta recentemente, verifique seu email para confirmar a conta.</p>
                </div>
              </div>
            </div>

            <div className="text-center border-t border-slate-200 pt-6">
              <p className="text-sm text-slate-600 mb-2">
                Para teste, use: <strong className="text-slate-800">admin@sistema.com</strong>
              </p>
              <p className="text-xs text-slate-500 mb-4">
                (Se ainda não criou a conta, use o botão abaixo)
              </p>
              
              <Button
                onClick={() => navigate('/auth-setup')}
                variant="outline"
                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurar Autenticação
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
