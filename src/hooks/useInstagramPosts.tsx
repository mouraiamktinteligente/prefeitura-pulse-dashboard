import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InstagramPost {
  id: string;
  profile: string;
  image_url?: string;
  link_publico_imagem?: string;
  description?: string;
  likes_count?: number;
  comments_count?: number;
  created_at: string;
  instagram_post_id?: string;
}

interface UseInstagramPostsReturn {
  latestPost: InstagramPost | null;
  loading: boolean;
  error: string | null;
}

export const useInstagramPosts = (profile?: string): UseInstagramPostsReturn => {
  const [latestPost, setLatestPost] = useState<InstagramPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      console.log('No profile provided to useInstagramPosts');
      setLatestPost(null);
      return;
    }

    console.log('🚀 useInstagramPosts: Starting for profile:', profile);
    let retryCount = 0;
    const maxRetries = 3;
    let timeoutId: NodeJS.Timeout;

    const fetchLatestPost = async (isRetry = false) => {
      try {
        if (!isRetry) {
          setLoading(true);
          setError(null);
        }
        
        console.log(`📡 Fetching Instagram posts for profile: ${profile} (attempt ${retryCount + 1})`);
        
        // Prioritize posts with link_publico_imagem (Supabase Storage URLs work better)
        let { data, error: supabaseError } = await supabase
          .from('instagram_posts' as any)
          .select('*')
          .eq('profile', profile)
          .not('link_publico_imagem', 'is', null)
          .neq('link_publico_imagem', '')
          .order('created_at', { ascending: false })
          .limit(1) as any;

        console.log(`📊 Primeira busca (link_publico_imagem): ${data?.length || 0} posts encontrados`);

        // If no post with link_publico_imagem found, try image_url
        if (!data || data.length === 0) {
          console.log('🔍 Nenhum post com link_publico_imagem encontrado, buscando com image_url...');
          ({ data, error: supabaseError } = await supabase
            .from('instagram_posts' as any)
            .select('*')
            .eq('profile', profile)
            .not('image_url', 'is', null)
            .neq('image_url', '')
            .order('created_at', { ascending: false })
            .limit(1) as any);
          
          console.log(`📊 Segunda busca (image_url): ${data?.length || 0} posts encontrados`);
        }

        // Final fallback: if still no data, just get the latest post regardless
        if (!data || data.length === 0) {
          console.log('⚠️ Nenhum post com imagem encontrado, pegando último post disponível...');
          ({ data, error: supabaseError } = await supabase
            .from('instagram_posts' as any)
            .select('*')
            .eq('profile', profile)
            .order('created_at', { ascending: false })
            .limit(1) as any);
          
          console.log(`📊 Terceira busca (qualquer post): ${data?.length || 0} posts encontrados`);
        }

        if (supabaseError) {
          console.error('❌ Supabase error:', supabaseError);
          throw supabaseError;
        }

        console.log('📊 Instagram posts data received:', data);
        
        if (data && data.length > 0) {
          const post = data[0] as InstagramPost;
          console.log('✅ Setting latest post:', {
            id: post.id,
            profile: post.profile,
            hasPublicImage: !!post.link_publico_imagem,
            hasImage: !!post.image_url,
            publicImageUrl: post.link_publico_imagem,
            imageUrl: post.image_url,
            description: post.description?.substring(0, 50) + '...',
            likes: post.likes_count,
            comments: post.comments_count
          });
          setLatestPost(post);
        } else {
          console.log('📭 No posts found for profile:', profile);
          setLatestPost(null);
        }
        
        // Reset retry count on success
        retryCount = 0;
        
      } catch (err) {
        console.error('❌ Error fetching Instagram post:', err);
        
        // Retry logic for network errors
        if (retryCount < maxRetries && (err as any)?.message?.includes?.('network')) {
          retryCount++;
          console.log(`🔄 Retrying in 2s... (${retryCount}/${maxRetries})`);
          setTimeout(() => fetchLatestPost(true), 2000);
          return;
        }
        
        setError('Erro ao carregar postagem do Instagram');
        setLatestPost(null);
      } finally {
        if (!isRetry) {
          setLoading(false);
        }
      }
    };

    // Initial fetch with timeout fallback
    fetchLatestPost();
    
    // Fallback timeout - if data doesn't load in 10s, try again
    timeoutId = setTimeout(() => {
      console.log('⏰ Timeout reached, attempting fallback fetch...');
      if (!latestPost && !loading) {
        fetchLatestPost(true);
      }
    }, 10000);

    // Set up real-time subscription with enhanced error handling
    let channel: any;
    
    try {
      console.log('🔄 Setting up real-time subscription for profile:', profile);
      
      channel = supabase
        .channel(`instagram-posts-${profile}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'instagram_posts',
            filter: `profile=eq.${profile}`
          },
          (payload) => {
            console.log('📥 New Instagram post inserted:', payload);
            if (payload.new && payload.new.profile === profile) {
              const newPost = payload.new as InstagramPost;
              console.log('📥 Processing new post:', {
                id: newPost.id,
                hasImage: !!newPost.image_url,
                imageUrl: newPost.image_url
              });
              
              setLatestPost(current => {
                if (!current || new Date(newPost.created_at) > new Date(current.created_at)) {
                  console.log('✅ Updating to newer post:', newPost.id);
                  return newPost;
                }
                return current;
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'instagram_posts',
            filter: `profile=eq.${profile}`
          },
          (payload) => {
            console.log('📝 Instagram post updated:', payload);
            if (payload.new && payload.new.profile === profile) {
              const updatedPost = payload.new as InstagramPost;
              setLatestPost(current => {
                if (current && current.id === updatedPost.id) {
                  console.log('✅ Updating current post with new data:', updatedPost.id);
                  return updatedPost;
                }
                if (!current || new Date(updatedPost.created_at) > new Date(current.created_at)) {
                  console.log('✅ Updating to newer updated post:', updatedPost.id);
                  return updatedPost;
                }
                return current;
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'instagram_posts',
            filter: `profile=eq.${profile}`
          },
          (payload) => {
            console.log('🗑️ Instagram post deleted:', payload);
            if (payload.old && payload.old.profile === profile) {
              const deletedPost = payload.old as InstagramPost;
              setLatestPost(current => {
                if (current && current.id === deletedPost.id) {
                  console.log('🔄 Current post was deleted, refetching...');
                  fetchLatestPost(true);
                  return null;
                }
                return current;
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Real-time subscription status:', status);
          if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Real-time channel error, falling back to polling');
            // Fallback: poll for data every 30 seconds if real-time fails
            const pollInterval = setInterval(() => {
              console.log('🔄 Polling for updates due to real-time error...');
              fetchLatestPost(true);
            }, 30000);
            
            return () => clearInterval(pollInterval);
          }
        });
        
    } catch (realtimeError) {
      console.error('❌ Real-time setup failed:', realtimeError);
      // If real-time fails, setup polling as fallback
      const pollInterval = setInterval(() => {
        console.log('🔄 Polling for updates (real-time unavailable)...');
        fetchLatestPost(true);
      }, 30000);
      
      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeoutId);
      };
    }

    return () => {
      console.log('🧹 Cleaning up useInstagramPosts for profile:', profile);
      if (channel) {
        supabase.removeChannel(channel);
      }
      clearTimeout(timeoutId);
    };
  }, [profile]);

  return { latestPost, loading, error };
};