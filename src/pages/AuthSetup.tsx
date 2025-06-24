import React, { useState, useEffect } from 'react';
import { CreateAuthUser } from '@/components/CreateAuthUser';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Users, Key, CheckCircle } from "lucide-react";
import { supabase from "@/integrations/supabase/client";

interface AuthUser {
  id: string;
  email: string | undefined;
  email_confirmed_at: string | null;
  created_at: string;
}

const AuthSetup = () => {
  const navigate = useNavigate();
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuthUsers = async () => {
    try {
      // Buscar usuários do sistema de autenticação
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
      } else {
        // Mapear os usuários do Supabase para o formato AuthUser
        const mappedUsers: AuthUser[] = (data.users || []).map(user => ({
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          created_at: user.created_at
        }));
        setAuthUsers(mappedUsers);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthUsers();
  }, []);

  const handleUserCreated = () => {
    // Atualizar lista de usuários quando um novo for criado
    fetchAuthUsers();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-4">
      <div className="max-w-6xl mx-auto">
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
              Configure usuários no sistema de autenticação
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CreateAuthUser onUserCreated={handleUserCreated} />
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/90 border-slate-600/50 shadow-xl backdrop-blur-sm">
              <CardHeader className="bg-slate-700/50 border-b border-slate-600/50">
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Users className="w-5 h-5 text-blue-400" />
                  Usuários no Sistema de Autenticação
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="text-slate-300">Carregando usuários...</div>
                ) : authUsers.length === 0 ? (
                  <div className="text-slate-400 text-center py-4">
                    Nenhum usuário cadastrado no sistema de autenticação
                  </div>
                ) : (
                  <div className="space-y-3">
                    {authUsers.map((user) => (
                      <div key={user.id} className="p-4 bg-slate-700/60 border border-slate-500/40 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-100">{user.email || 'Email não disponível'}</span>
                          <div className="flex items-center gap-2">
                            {user.email_confirmed_at ? (
                              <span className="text-xs bg-green-600/70 text-green-100 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Confirmado
                              </span>
                            ) : (
                              <span className="text-xs bg-amber-600/70 text-amber-100 px-3 py-1 rounded-full font-medium">
                                Aguardando Confirmação
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 mt-2">
                          Criado em: {new Date(user.created_at).toLocaleString('pt-BR')}
                        </p>
                        {!user.email_confirmed_at && (
                          <p className="text-xs text-amber-300 mt-1">
                            ⚠️ Email precisa ser confirmado para fazer login
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
                  <div className="p-3 bg-blue-900/40 border border-blue-600/40 rounded-lg">
                    <p className="font-semibold text-blue-200 mb-2">📧 Confirmação de Email:</p>
                    <p>
                      Por padrão, o Supabase requer confirmação de email. O usuário receberá um email 
                      para confirmar a conta antes de poder fazer login.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-amber-900/40 border border-amber-600/40 rounded-lg">
                    <p className="font-semibold text-amber-200 mb-2">⚡ Para Desenvolvimento:</p>
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
                      <strong className="text-slate-100">4.</strong> O usuário admin@sistema.com já existe na tabela usuarios_sistema
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
