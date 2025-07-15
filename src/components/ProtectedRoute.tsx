
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  allowedTypes?: ('administrador' | 'usuario' | 'cliente')[];
}

export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  allowedTypes 
}: ProtectedRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const { userSystem, loading: permissionsLoading } = useUserPermissions();

  if (authLoading || permissionsLoading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!userSystem) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Acesso Negado</h2>
          <p className="text-red-600">
            Usuário não cadastrado no sistema. Entre em contato com o administrador.
          </p>
        </div>
      </div>
    );
  }

  if (requireAdmin && userSystem.tipo_usuario !== 'administrador') {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Acesso Restrito</h2>
          <p className="text-red-600">
            Esta área é restrita para administradores.
          </p>
        </div>
      </div>
    );
  }

  if (allowedTypes && !allowedTypes.includes(userSystem.tipo_usuario)) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Acesso Negado</h2>
          <p className="text-red-600">
            Você não tem permissão para acessar esta área.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
