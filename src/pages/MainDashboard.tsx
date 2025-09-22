
import React from 'react';
import { ClientCard } from '@/components/ClientCard';
import { PhoneMockup } from '@/components/PhoneMockup';
import { useClients } from '@/hooks/useClients';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeIndicator } from '@/components/RealtimeIndicator';

const MainDashboard = () => {
  const { clients, loading } = useClients();
  const navigate = useNavigate();

  console.log('MainDashboard - Estado do loading:', loading);
  console.log('MainDashboard - Quantidade de clientes:', clients.length);
  console.log('MainDashboard - Lista de clientes:', clients);

  // useEffect para configurar listener realtime de clientes
  React.useEffect(() => {
    let channel: any = null;

    const setupRealtimeListener = async () => {
      try {
        channel = supabase
          .channel('clients-realtime')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'cadastro_clientes'
          }, (payload) => {
            console.log('Clients realtime event:', payload);
            // O hook useClients já deve ter seu próprio listener, 
            // mas garantimos que o componente reaja a mudanças
          });

        await channel.subscribe();
        console.log('Listener realtime de clientes no MainDashboard configurado com sucesso');
      } catch (error) {
        console.warn('Erro ao configurar listener realtime no MainDashboard:', error);
        // Continue without realtime - the app should work without it
      }
    };

    setupRealtimeListener();

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.warn('Erro ao remover canal realtime no MainDashboard:', error);
        }
      }
    };
  }, []);

  const handleClientClick = (clientId: string) => {
    // Navega para o dashboard detalhado passando o ID do cliente
    navigate(`/dashboard/${clientId}`);
  };

  const handleAddClient = () => {
    navigate('/cadastro');
  };

  if (loading) {
    console.log('MainDashboard - Renderizando loading...');
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="text-white text-lg">Carregando clientes...</div>
      </div>
    );
  }

  console.log('MainDashboard - Renderizando dashboard com', clients.length, 'clientes');

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
              <h2 className="text-white text-xl font-semibold">
                Clientes Monitorados ({clients.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-2 gap-y-6 justify-items-center">
              {clients.map((client) => (
                <PhoneMockup
                  key={client.id}
                  client={client}
                  onClick={() => handleClientClick(client.id)}
                >
                  <ClientCard
                    client={client}
                    onClick={() => handleClientClick(client.id)}
                  />
                </PhoneMockup>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MainDashboard;
