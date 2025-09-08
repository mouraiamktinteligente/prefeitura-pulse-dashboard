import React from 'react';
import { PhoneMockup } from '@/components/PhoneMockup';
import { ClientCard } from '@/components/ClientCard';
import { useInstagramPosts } from '@/hooks/useInstagramPosts';
import type { Cliente } from '@/hooks/useClients';

interface ClientMockupWrapperProps {
  client: Cliente;
  onClick: () => void;
}

export const ClientMockupWrapper: React.FC<ClientMockupWrapperProps> = ({ client, onClick }) => {
  const { latestPost } = useInstagramPosts(client.instagram_prefeitura);
  
  // Use link_publico_imagem as priority, fallback to image_url
  const instagramImageUrl = latestPost?.link_publico_imagem || latestPost?.image_url;

  return (
    <PhoneMockup
      client={client}
      onClick={onClick}
      instagramImageUrl={instagramImageUrl}
    >
      <ClientCard
        client={client}
        onClick={onClick}
      />
    </PhoneMockup>
  );
};