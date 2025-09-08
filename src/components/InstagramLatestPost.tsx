
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useInstagramPosts } from '@/hooks/useInstagramPosts';

interface InstagramLatestPostProps {
  profile?: string;
}

export const InstagramLatestPost: React.FC<InstagramLatestPostProps> = ({ profile }) => {
  const [imageError, setImageError] = useState(false);
  const { latestPost, loading, error } = useInstagramPosts(profile);

  console.log('🎨 InstagramLatestPost render:', {
    profile,
    hasPost: !!latestPost,
    imageUrl: latestPost?.image_url,
    imageError,
    latestPost: latestPost ? {
      id: latestPost.id,
      description: latestPost.description?.substring(0, 50) + '...',
      created_at: latestPost.created_at
    } : null
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'há poucos minutos';
    if (diffInHours < 24) return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `há ${diffInMonths} mês${diffInMonths > 1 ? 'es' : ''}`;
  };

  const username = profile?.replace('@', '') || 'perfil';

  if (loading) {
    return (
      <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 h-[480px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Instagram className="w-5 h-5 text-pink-400" />
            Última Postagem no Instagram
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-2 h-[400px] overflow-hidden">
          <div className="rounded-lg overflow-hidden h-full p-2 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-20 h-3" />
            </div>
            <Skeleton className="w-full flex-1 mb-2 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-full h-3" />
              <Skeleton className="w-3/4 h-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !latestPost) {
    return (
      <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 h-[480px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Instagram className="w-5 h-5 text-pink-400" />
            Última Postagem no Instagram
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-2 h-[400px] overflow-hidden flex items-center justify-center">
          <div className="text-center text-white/70">
            <Instagram className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {error ? error : 'Nenhuma postagem encontrada para este perfil'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300 h-[480px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <Instagram className="w-5 h-5 text-pink-400" />
          Última Postagem no Instagram
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-2 h-[400px] overflow-hidden">
        <div className="rounded-lg overflow-hidden h-full flex flex-col">
          {/* Post Header */}
          <div className="flex items-center gap-2 mb-3">
            <Instagram className="w-4 h-4 text-pink-400" />
            <p className="text-white font-semibold text-sm">@{username}</p>
          </div>

          {/* Post Image */}
          <div className="relative mb-3 flex-1">
            {latestPost.image_url && !imageError ? (
              <img 
                src={latestPost.image_url}
                alt="Post do Instagram" 
                className="w-full h-full object-cover rounded-lg"
                onLoad={() => {
                  console.log('✅ Imagem do Instagram carregada diretamente');
                  setImageError(false);
                }}
                onError={() => {
                  console.log('❌ Erro ao carregar imagem do Instagram - mostrando placeholder');
                  setImageError(true);
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-white/70">
                  <Instagram className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">
                    {latestPost.image_url ? 'Imagem não pode ser carregada' : 'Imagem não disponível'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Post Info */}
          <div className="space-y-2">
            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-white hover:text-red-500 cursor-pointer" />
                <MessageCircle className="w-4 h-4 text-white cursor-pointer" />
                <Send className="w-4 h-4 text-white cursor-pointer" />
              </div>
              <Bookmark className="w-4 h-4 text-white cursor-pointer" />
            </div>

            {/* Likes */}
            <p className="text-white font-semibold text-sm">
              {(latestPost.likes_count || 0).toLocaleString()} curtidas
            </p>

            {/* Caption */}
            {latestPost.description && (
              <div className="text-white text-sm">
                <span className="font-semibold">@{username}</span>
                <span className="ml-1 line-clamp-2">
                  {latestPost.description}
                </span>
              </div>
            )}

            {/* Time */}
            <p className="text-gray-400 text-xs">
              {formatTimeAgo(latestPost.created_at)}
            </p>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};
