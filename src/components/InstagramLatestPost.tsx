
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';

interface InstagramLatestPostProps {
  clientName?: string;
}

export const InstagramLatestPost: React.FC<InstagramLatestPostProps> = ({ clientName }) => {
  // Dados simulados da última postagem do Instagram
  const mockPost = {
    username: clientName?.toLowerCase().replace(/\s+/g, '') || 'cliente',
    userProfileImage: "https://picsum.photos/40/40?random=profile",
    postImage: "https://picsum.photos/600/600?random=post",
    caption: "Confira as últimas novidades e projetos em andamento! 🏛️✨ #Transparencia #Gestao #Cidade",
    likes: Math.floor(Math.random() * 5000) + 1000,
    comments: [
      { username: "marco.hoffer", text: "🔥🔥🔥😍😍😍", liked: true },
      { username: "bruno.manzan", text: "Vlwww demais meu maestro! Sem você não sou nada! Pra cima! 🔥🙌", liked: true },
      { username: "josi_gomess", text: "E eu te amo e te admiro demais ❤️", liked: true },
      { username: "diegorodrigues.ia", text: "🔥🔥", liked: true },
      { username: "elvismusicc", text: "Boaaaa Marquin 👏👏👏🔥🔥", liked: true }
    ],
    timeAgo: "há 3 dias"
  };

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
                src={mockPost.userProfileImage} 
                alt="Profile" 
                className="w-6 h-6 rounded-full"
              />
              <div>
                <p className="text-white font-semibold text-xs">@{mockPost.username}</p>
              </div>
            </div>
          </div>

          {/* Post Image */}
          <div className="relative">
            <img 
              src={mockPost.postImage} 
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
              {mockPost.likes.toLocaleString()} curtidas
            </p>

            {/* Caption */}
            <div className="text-white text-xs mb-2">
              <span className="font-semibold">@{mockPost.username}</span>
              <span className="ml-1 line-clamp-2">{mockPost.caption}</span>
            </div>

            {/* Comments */}
            <div className="space-y-1 mb-2">
              {mockPost.comments.slice(0, 2).map((comment, index) => (
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
              {mockPost.timeAgo}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
