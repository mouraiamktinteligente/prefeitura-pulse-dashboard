
import React from 'react';
import { ClientCard } from '@/components/ClientCard';
import { useClients } from '@/hooks/useClients';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MainDashboard = () => {
  const { clients, loading } = useClients();
  const navigate = useNavigate();

  const handleClientClick = (clientId: string) => {
    // Navega para o dashboard detalhado passando o ID do cliente
    navigate(`/dashboard/${clientId}`);
  };

  const handleAddClient = () => {
    navigate('/cadastro');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="text-white text-lg">Carregando clientes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-900">
      <main className="container mx-auto px-6 py-8">
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-blue-700 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-white text-xl font-semibold mb-4">
                Nenhum cliente cadastrado
              </h3>
              <p className="text-blue-300 mb-6">
                Cadastre seu primeiro cliente para começar o monitoramento.
              </p>
              <Button
                onClick={handleAddClient}
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Cliente
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-white text-xl font-semibold mb-2">
                Clientes Monitorados ({clients.length})
              </h2>
              <p className="text-blue-300">
                Clique em qualquer cliente para ver o dashboard completo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {clients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onClick={() => handleClientClick(client.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MainDashboard;
