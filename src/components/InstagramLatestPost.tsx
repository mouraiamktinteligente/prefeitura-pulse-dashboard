
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useInstagramPosts } from '@/hooks/useInstagramPosts';

interface InstagramLatestPostProps {
  profile?: string;
}

export const InstagramLatestPost: React.FC<InstagramLatestPostProps> = ({ profile }) => {
  const { latestPost, loading, error } = useInstagramPosts(profile);

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
  const userProfileImage = "https://picsum.photos/40/40?random=profile";
  
  const mockComments = [
    { username: "marco.hoffer", text: "🔥🔥🔥😍😍😍", liked: true },
    { username: "bruno.manzan", text: "Vlwww demais meu maestro! Sem você não sou nada! Pra cima! 🔥🙌", liked: true },
    { username: "josi_gomess", text: "E eu te amo e te admiro demais ❤️", liked: true },
    { username: "diegorodrigues.ia", text: "🔥🔥", liked: true },
    { username: "elvismusicc", text: "Boaaaa Marquin 👏👏👏🔥🔥", liked: true }
  ];

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
          <div className="bg-black rounded-lg overflow-hidden h-full p-2">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-20 h-3" />
            </div>
            <Skeleton className="w-full h-48 mb-2" />
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
        {/* Instagram Post Layout - Compact version */}
        <div className="bg-black rounded-lg overflow-hidden h-full">
          {/* Post Header */}
          <div className="flex items-center justify-between p-2 bg-black">
            <div className="flex items-center gap-2">
              <img 
                src={userProfileImage} 
                alt="Profile" 
                className="w-6 h-6 rounded-full"
              />
              <div>
                <p className="text-white font-semibold text-xs">@{username}</p>
              </div>
            </div>
          </div>

          {/* Post Image */}
          <div className="relative">
            <img 
              src={latestPost.image_url || "https://picsum.photos/600/600?random=post"} 
              alt="Post" 
              className="w-full h-48 object-cover"
            />
          </div>

          {/* Post Actions */}
          <div className="p-2 bg-black">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-white hover:text-red-500 cursor-pointer" />
                <MessageCircle className="w-4 h-4 text-white cursor-pointer" />
                <Send className="w-4 h-4 text-white cursor-pointer" />
              </div>
              <Bookmark className="w-4 h-4 text-white cursor-pointer" />
            </div>

            {/* Likes */}
            <p className="text-white font-semibold text-xs mb-1">
              {(latestPost.likes_count || 0).toLocaleString()} curtidas
            </p>

            {/* Caption */}
            <div className="text-white text-xs mb-2">
              <span className="font-semibold">@{username}</span>
              <span className="ml-1 line-clamp-2">
                {latestPost.description || "Confira as últimas novidades! 🏛️✨ #Transparencia #Gestao"}
              </span>
            </div>

            {/* Comments */}
            <div className="space-y-1 mb-2">
              {mockComments.slice(0, 2).map((comment, index) => (
                <div key={index} className="flex items-start gap-1">
                  <span className="text-white font-semibold text-xs">{comment.username}</span>
                  <span className="text-white text-xs flex-1 truncate">{comment.text}</span>
                  {comment.liked && (
                    <Heart className="w-2 h-2 text-red-500 fill-current flex-shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>

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
