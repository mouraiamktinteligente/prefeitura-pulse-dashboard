
import React, { useState } from 'react';
import { CreateAuthUser } from '@/components/CreateAuthUser';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Key, CheckCircle, Users } from "lucide-react";

const AuthSetup = () => {
  const navigate = useNavigate();

  const handleUserCreated = () => {
    console.log('Usuário criado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => navigate('/login')}
            variant="ghost"
            className="text-blue-100 hover:bg-blue-700/50 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Login
          </Button>
          
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-blue-100" />
            </div>
            <h1 className="text-3xl font-bold text-blue-50 mb-2">
              Configuração de Autenticação
            </h1>
            <p className="text-blue-200">
              Crie usuários no sistema de autenticação
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <CreateAuthUser onUserCreated={handleUserCreated} />
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-slate-800/90 border-slate-600/50 shadow-xl backdrop-blur-sm">
              <CardHeader className="bg-slate-700/50 border-b border-slate-600/50">
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Users className="w-5 h-5 text-blue-400" />
                  Status do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-900/40 border border-green-600/40 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="font-semibold text-green-200">Sistema Configurado</p>
                      <p className="text-sm text-green-300">
                        O usuário admin@sistema.com já existe na tabela usuarios_sistema
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-900/40 border border-blue-600/40 rounded-lg">
                    <p className="font-semibold text-blue-200 mb-2">✅ Teste de Login:</p>
                    <p className="text-sm text-blue-300">
                      Use <strong>admin@sistema.com</strong> para fazer login após criar a conta no sistema de autenticação.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/90 border-slate-600/50 shadow-xl backdrop-blur-sm">
              <CardHeader className="bg-slate-700/50 border-b border-slate-600/50">
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Key className="w-5 h-5 text-blue-400" />
                  Instruções
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="text-sm space-y-3 text-slate-200 leading-relaxed">
                  <div className="p-3 bg-amber-900/40 border border-amber-600/40 rounded-lg">
                    <p className="font-semibold text-amber-200 mb-2">📧 Confirmação de Email:</p>
                    <p>
                      Por padrão, o Supabase requer confirmação de email. O usuário receberá um email 
                      para confirmar a conta antes de poder fazer login.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-900/40 border border-blue-600/40 rounded-lg">
                    <p className="font-semibold text-blue-200 mb-2">⚡ Para Desenvolvimento:</p>
                    <p>
                      Você pode desabilitar a confirmação de email em{' '}
                      <strong>Authentication → Settings → Email Auth</strong> no painel do Supabase 
                      para facilitar os testes.
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    <p>
                      <strong className="text-slate-100">1.</strong> Crie o usuário usando o formulário ao lado
                    </p>
                    <p>
                      <strong className="text-slate-100">2.</strong> Confirme o email (se necessário)
                    </p>
                    <p>
                      <strong className="text-slate-100">3.</strong> Faça login normalmente na tela de login
                    </p>
                    <p>
                      <strong className="text-slate-100">4.</strong> O sistema verificará automaticamente as permissões
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSetup;
