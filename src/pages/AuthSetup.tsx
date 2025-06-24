
import React from 'react';
import { CreateAuthUser } from '@/components/CreateAuthUser';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Users, Key } from "lucide-react";

const AuthSetup = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => navigate('/login')}
            variant="ghost"
            className="text-white hover:bg-blue-700/50 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Login
          </Button>
          
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Configuração de Autenticação
            </h1>
            <p className="text-blue-200">
              Configure usuários no sistema de autenticação
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <CreateAuthUser />
          </div>
          
          <div className="space-y-6">
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Users className="w-5 h-5 text-blue-600" />
                  Usuários Cadastrados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">admin@sistema.com</span>
                    <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                      Administrador
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">
                    Administrador Principal
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Key className="w-5 h-5 text-blue-600" />
                  Instruções
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                <div className="text-sm space-y-3 text-gray-700 leading-relaxed">
                  <p>
                    <strong className="text-gray-900">1.</strong> Use este formulário para criar o usuário <code className="bg-gray-100 px-2 py-1 rounded text-blue-700 font-mono text-xs">admin@sistema.com</code> no sistema de autenticação.
                  </p>
                  <p>
                    <strong className="text-gray-900">2.</strong> Defina uma senha segura (mínimo 6 caracteres).
                  </p>
                  <p>
                    <strong className="text-gray-900">3.</strong> Após criar, volte à tela de login e faça o login normalmente.
                  </p>
                  <p>
                    <strong className="text-gray-900">4.</strong> Este usuário já está cadastrado na tabela de usuários do sistema.
                  </p>
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
