
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    
    // Simulação de login - em produção, conectar com Supabase
    setTimeout(() => {
      console.log('Login realizado:', { email, password });
      navigate('/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bem-vindo à Plataforma
          </h1>
          <p className="text-blue-300 text-lg">
            Gestão Municipal
          </p>
        </div>

        {/* Card de Login */}
        <Card className="bg-blue-800/50 backdrop-blur-sm border-blue-700/50 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-white">
              Acesse sua conta
            </CardTitle>
            <CardDescription className="text-blue-300">
              Digite suas credenciais para continuar
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo E-mail */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-blue-900/50 border-blue-600/50 text-white placeholder:text-blue-400 focus:border-blue-400 focus:ring-blue-400"
                  required
                />
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-blue-900/50 border-blue-600/50 text-white placeholder:text-blue-400 focus:border-blue-400 focus:ring-blue-400 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-blue-400 hover:text-blue-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Botão Entrar */}
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 text-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>

              {/* Link Esqueceu Senha */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors duration-200 hover:underline"
                  onClick={() => alert('Funcionalidade de recuperação de senha em desenvolvimento')}
                >
                  Esqueceu sua senha?
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-400 text-sm">
            © 2024 Dashboard - Gestão Municipal
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
