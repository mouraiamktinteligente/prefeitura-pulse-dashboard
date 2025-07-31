import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForceClearing, setIsForceClearing] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Função para forçar desconexão em caso de sessão travada
  const forceDisconnect = async (userEmail: string) => {
    setIsForceClearing(true);
    try {
      // Usar a função RPC para forçar logout
      await supabase.rpc('force_logout_user', {
        user_email: userEmail,
        motivo: 'force_disconnect_login'
      });

      // Limpar dados locais também
      localStorage.removeItem('auth_user');
      localStorage.removeItem('session_token');
      sessionStorage.clear();

      toast({
        title: "Sessão Limpa",
        description: "Sessão anterior foi removida. Tente fazer login novamente.",
        variant: "default"
      });

      // Tentar login novamente após 2 segundos
      setTimeout(() => {
        handleSubmit(new Event('submit') as any);
      }, 2000);

    } catch (error) {
      console.error('Erro ao forçar desconexão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível limpar a sessão. Contate o administrador.",
        variant: "destructive"
      });
    } finally {
      setIsForceClearing(false);
    }
  };

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
        // Verificar se é erro de usuário já conectado
        const isUserAlreadyConnected = error.message?.includes('já está conectado');
        
        if (isUserAlreadyConnected) {
          // Oferecer opção de forçar desconexão
          toast({
            title: "Usuário já conectado",
            description: "Este usuário já possui uma sessão ativa. Deseja forçar a desconexão?",
            variant: "destructive",
            action: (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => forceDisconnect(email)}
                disabled={isForceClearing}
              >
                {isForceClearing ? "Limpando..." : "Forçar Logout"}
              </Button>
            )
          });
        } else {
          toast({
            title: "Credenciais inválidas",
            description: "E-mail ou senha incorretos. Verifique os dados e tente novamente.",
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
            MourIA Marketing
          </CardTitle>
          <p className="text-slate-600 text-lg">Faça login em sua conta</p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {/* Aviso sobre detecção de fechamento do navegador */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <strong>Novo:</strong> Sistema com detecção automática de fechamento do navegador. 
                Sua sessão será encerrada automaticamente se o navegador for fechado sem logout.
              </div>
            </div>
          </div>

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
              disabled={isLoading || isForceClearing}
            >
              {isLoading ? "Entrando..." : isForceClearing ? "Limpando sessão..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;