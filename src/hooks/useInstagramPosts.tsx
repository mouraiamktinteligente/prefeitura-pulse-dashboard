import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InstagramPost {
  id: string;
  profile: string;
  image_url?: string;
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
      setLatestPost(null);
      return;
    }

    const fetchLatestPost = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching Instagram posts for profile:', profile);
        
        // Use rpc or direct query with type assertion
        const { data, error: supabaseError } = await supabase
          .from('instagram_posts' as any)
          .select('*')
          .eq('profile', profile)
          .order('created_at', { ascending: false })
          .limit(1) as any;

        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          throw supabaseError;
        }

        console.log('Instagram posts data:', data);
        
        if (data && data.length > 0) {
          setLatestPost(data[0] as InstagramPost);
        } else {
          setLatestPost(null);
        }
      } catch (err) {
        console.error('Error fetching Instagram post:', err);
        setError('Erro ao carregar postagem do Instagram');
        setLatestPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPost();

    // Set up real-time subscription for new posts
    const channel = supabase
      .channel('instagram-posts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'instagram_posts',
          filter: `profile=eq.${profile}`
        },
        (payload) => {
          console.log('New Instagram post received:', payload);
          if (payload.new && payload.new.profile === profile) {
            fetchLatestPost(); // Refetch to get the latest post
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  return { latestPost, loading, error };
};