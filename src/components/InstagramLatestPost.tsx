
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
      { username: "elvismusicc", text: "Boaaaa Marquin 👏👏👏🔥🔥", liked: true },
      { username: "guidcastro", text: "🙌🙌🙌", liked: true },
      { username: "oliveirafabio_7", text: "Boooooga meu amigo 🔥", liked: true },
      { username: "robinho_elias14", text: "Monstroooo", liked: true }
    ],
    timeAgo: "há 3 dias"
  };

  return (
    <Card className="bg-blue-700 backdrop-blur-sm shadow-xl border border-blue-600 hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <Instagram className="w-6 h-6 text-pink-400" />
          Última Postagem no Instagram
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instagram Post Layout */}
        <div className="bg-black rounded-lg overflow-hidden max-w-md mx-auto">
          {/* Post Header */}
          <div className="flex items-center justify-between p-3 bg-black">
            <div className="flex items-center gap-3">
              <img 
                src={mockPost.userProfileImage} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-white font-semibold text-sm">@{mockPost.username}</p>
                <p className="text-gray-400 text-xs">Áudio original</p>
              </div>
            </div>
            <button className="text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          </div>

          {/* Post Image */}
          <div className="relative">
            <img 
              src={mockPost.postImage} 
              alt="Post" 
              className="w-full h-64 object-cover"
            />
          </div>

          {/* Post Actions */}
          <div className="p-3 bg-black">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <Heart className="w-6 h-6 text-white hover:text-red-500 cursor-pointer" />
                <MessageCircle className="w-6 h-6 text-white cursor-pointer" />
                <Send className="w-6 h-6 text-white cursor-pointer" />
              </div>
              <Bookmark className="w-6 h-6 text-white cursor-pointer" />
            </div>

            {/* Likes */}
            <p className="text-white font-semibold text-sm mb-2">
              {mockPost.likes.toLocaleString()} curtidas
            </p>

            {/* Caption */}
            <div className="text-white text-sm mb-3">
              <span className="font-semibold">@{mockPost.username}</span>
              <span className="ml-2">{mockPost.caption}</span>
            </div>

            {/* Comments */}
            <div className="space-y-1 mb-3">
              {mockPost.comments.slice(0, 3).map((comment, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-white font-semibold text-sm">{comment.username}</span>
                  <span className="text-white text-sm flex-1">{comment.text}</span>
                  {comment.liked && (
                    <Heart className="w-3 h-3 text-red-500 fill-current flex-shrink-0 mt-0.5" />
                  )}
                </div>
              ))}
            </div>

            {/* View More Comments */}
            <p className="text-gray-400 text-sm mb-2 cursor-pointer">
              Ver insights
            </p>

            {/* Time */}
            <p className="text-gray-400 text-xs">
              {mockPost.timeAgo}
            </p>
          </div>

          {/* Add Comment */}
          <div className="border-t border-gray-800 p-3 bg-black">
            <div className="flex items-center gap-3">
              <input 
                type="text" 
                placeholder="Adicione um comentário..." 
                className="flex-1 bg-transparent text-white text-sm placeholder-gray-400 outline-none"
              />
              <button className="text-blue-400 font-semibold text-sm">Postar</button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
