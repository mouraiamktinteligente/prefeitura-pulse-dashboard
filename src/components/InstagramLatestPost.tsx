
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useInstagramPosts } from '@/hooks/useInstagramPosts';
import { useImageDownloader } from '@/hooks/useImageDownloader';

interface InstagramLatestPostProps {
  profile?: string;
}

export const InstagramLatestPost: React.FC<InstagramLatestPostProps> = ({ profile }) => {
  console.log('🚨 COMPONENTE INSTAGRAM RENDERIZADO:', { profile });
  
  const { latestPost, loading, error } = useInstagramPosts(profile);
  const { localImageUrl, isDownloading, downloadError } = useImageDownloader(
    latestPost?.image_url,
    latestPost?.id
  );

  console.log('🎨 InstagramLatestPost render:', {
    profile,
    hasPost: !!latestPost,
    imageUrl: latestPost?.image_url,
    localImageUrl,
    isDownloading,
    downloadError,
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
            <div className="w-full h-full bg-red-500 text-white p-4 rounded-lg">
              <p>🚨 TESTE IMAGEM:</p>
              <p>URL: {latestPost.image_url}</p>
              <p>Local: {localImageUrl}</p>
              <p>Loading: {isDownloading ? 'SIM' : 'NÃO'}</p>
              <p>Error: {downloadError}</p>
            </div>
            {latestPost.image_url && (
              <img 
                src="https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/542336078_18367860271151691_7621049316410088238_n.jpg?stp=dst-jpg_e15_fr_p1080x1080_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2QElF7dU4q1_BSu4fZYpTrRgV5RJaet1FW32qNzy4LQ9-iWixjOtzFZxlTOk52Bs2AY&_nc_ohc=s7Sb3GTWdLAQ7kNvwEms4M7&_nc_gid=jonTKyO1TNSV5CD_iD3BJQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfYPUUVFfF53Ke0M2lCzE3ZLzM7UlwzlbH8viR_KpbHK2w&oe=68C4DC49&_nc_sid=10d13b"
                alt="Teste Instagram" 
                className="w-full h-32 object-cover rounded-lg mt-2"
                onLoad={() => console.log('✅ IMAGEM TESTE CARREGADA')}
                onError={(e) => console.error('❌ ERRO IMAGEM TESTE:', e)}
              />
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
