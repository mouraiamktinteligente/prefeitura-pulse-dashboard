import React from 'react';
import { Card } from '@/components/ui/card';
import type { Cliente } from '@/hooks/useClients';
import { useAlertasAtivos } from '@/hooks/useAlertasCrise';

interface PhoneMockupProps {
  client: Cliente;
  onClick: () => void;
  children: React.ReactNode;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({ client, onClick, children }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  
  // Buscar alertas ativos do cliente
  const { data: alertas } = useAlertasAtivos(
    client.instagram_prefeitura,
    client.instagram_prefeito
  );
  
  const temAlertaAtivo = (alertas && alertas.length > 0);

  // URL da imagem do mockup do iPhone no Storage
  const mockupImageUrl = `https://oztosavtfiifjaahpagf.supabase.co/storage/v1/object/public/banco_imagens_mockup/apple-iphone-16-pro-max`;

  return (
    <div className="relative inline-block group cursor-pointer" onClick={onClick}>
      {/* Luz pulsante vermelha para alerta de crise */}
      {temAlertaAtivo && (
        <div className="absolute -top-2 -right-2 z-50">
          <div className="relative">
            {/* Luz pulsante */}
            <div className="w-6 h-6 bg-red-500 rounded-full animate-ping absolute"></div>
            <div className="w-6 h-6 bg-red-600 rounded-full relative flex items-center justify-center shadow-lg shadow-red-500/50">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Container do iPhone */}
      <div className="relative w-80 h-[600px] mx-auto">
        {/* Imagem do iPhone de fundo */}
        <img
          src={mockupImageUrl}
          alt="iPhone 16 Pro Max Mockup"
          className={`absolute inset-0 w-full h-full object-contain z-10 transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        
        {/* Loading state */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] flex items-center justify-center z-5">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-white text-sm">Carregando mockup...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {imageError && (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] flex items-center justify-center z-5 border-4 border-gray-600">
            <div className="text-center p-4">
              <p className="text-white text-sm mb-2">Mockup indisponível</p>
              <p className="text-gray-400 text-xs">Usando visualização alternativa</p>
            </div>
          </div>
        )}

        {/* Área da tela do iPhone onde vai o conteúdo */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          {/* Posicionamento preciso da tela do iPhone */}
          <div 
            className="relative"
            style={{
              width: '300px', // Largura da tela aumentada para ocupar toda a tela real
              height: '540px', // Altura da tela aumentada
              marginTop: '30px', // Ajuste vertical otimizado
              borderRadius: '2.5rem', // Bordas arredondadas mais realistas para iPhone
              overflow: 'hidden', // Garante que nada saia dos limites da tela
            }}
          >
            {/* Conteúdo da tela (ClientCard redimensionado) */}
            <div 
              className="w-full h-full flex items-start justify-center pt-0 overflow-hidden"
            >
              <div className="transform scale-[0.87] origin-top">
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* Overlay de hover */}
        <div className="absolute inset-0 z-30 rounded-[2.5rem] transition-all duration-300 group-hover:bg-black/10 pointer-events-none" />
      </div>
    </div>
  );
};