import React from 'react';
import { Card } from '@/components/ui/card';
import type { Cliente } from '@/hooks/useClients';

interface PhoneMockupProps {
  client: Cliente;
  onClick: () => void;
  children: React.ReactNode;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({ client, onClick, children }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  // URL da imagem do mockup do iPhone no Storage
  const mockupImageUrl = `https://oztosavtfiifjaahpagf.supabase.co/storage/v1/object/public/banco_imagens_mockup/apple-iphone-16-pro-max`;

  return (
    <div className="relative inline-block group cursor-pointer" onClick={onClick}>
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
            className="relative overflow-hidden bg-black/5 backdrop-blur-sm"
            style={{
              width: '260px', // Largura da tela
              height: '460px', // Altura da tela
              marginTop: '70px', // Ajuste vertical para alinhar com a tela do iPhone
              borderRadius: '2.5rem', // Bordas arredondadas da tela
            }}
          >
            {/* Conteúdo da tela (ClientCard redimensionado) */}
            <div className="w-full h-full flex items-center justify-center p-2">
              <div className="transform scale-75 origin-center">
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* Overlay de hover */}
        <div className="absolute inset-0 z-30 rounded-[3rem] transition-all duration-300 group-hover:bg-black/10 group-hover:scale-105 pointer-events-none" />
      </div>

      {/* Label do cliente abaixo do mockup */}
      <div className="text-center mt-4">
        <h3 className="text-white font-semibold text-sm truncate px-2">
          {client.nome_completo}
        </h3>
      </div>
    </div>
  );
};