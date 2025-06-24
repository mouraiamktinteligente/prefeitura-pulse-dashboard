
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";

const FirstAccess = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  const { setFirstPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Recuperar dados do usuário passados pela tela de login
    const state = location.state as any;
    if (state?.user) {
      setUserData(state.user);
    } else {
      // Se não tem dados do usuário, redirecionar para login
      navigate('/login');
    }
  }, [location.state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
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

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (!userData?.email) {
      toast({
        title: "Erro",
        description: "Dados do usuário não encontrados.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await setFirstPassword(userData.email, password);
      
      if (error) {
        toast({
          title: "Erro",
          description: error.message || "Erro ao definir senha.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Senha definida com sucesso! Agora você pode fazer login.",
        });
        navigate('/login');
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

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl bg-slate-100/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800 mb-2">
            Primeiro Acesso
          </CardTitle>
          <p className="text-slate-600 text-lg">
            Olá, <strong>{userData.nome_completo}</strong>!
          </p>
          <p className="text-slate-600 text-sm">
            Defina sua senha para acessar o sistema
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-12 h-12 bg-white/80 border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500"
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
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-12 h-12 bg-white/80 border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold text-base shadow-lg transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Definindo senha..." : "Definir Senha"}
            </Button>
          </form>

          <div className="mt-8">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold">Primeira vez no sistema?</p>
                  <p>Defina uma senha segura que será usada nos próximos acessos.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirstAccess;
