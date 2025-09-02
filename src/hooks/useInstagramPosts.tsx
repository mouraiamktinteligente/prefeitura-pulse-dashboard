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

    // Set up real-time subscription for all post changes
    const channel = supabase
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
          console.log('New Instagram post inserted:', payload);
          if (payload.new && payload.new.profile === profile) {
            // For INSERT: check if it's newer than current latest post
            const newPost = payload.new as InstagramPost;
            setLatestPost(current => {
              if (!current || new Date(newPost.created_at) > new Date(current.created_at)) {
                console.log('Updating to newer post:', newPost);
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
          console.log('Instagram post updated:', payload);
          if (payload.new && payload.new.profile === profile) {
            const updatedPost = payload.new as InstagramPost;
            setLatestPost(current => {
              // Update if it's the same post we're currently showing
              if (current && current.id === updatedPost.id) {
                console.log('Updating current post with new data:', updatedPost);
                return updatedPost;
              }
              // If it's a newer post, update
              if (!current || new Date(updatedPost.created_at) > new Date(current.created_at)) {
                console.log('Updating to newer updated post:', updatedPost);
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
          console.log('Instagram post deleted:', payload);
          if (payload.old && payload.old.profile === profile) {
            const deletedPost = payload.old as InstagramPost;
            setLatestPost(current => {
              // If the deleted post is the one we're showing, refetch
              if (current && current.id === deletedPost.id) {
                console.log('Current post was deleted, refetching...');
                fetchLatestPost();
                return null; // Temporarily clear while refetching
              }
              return current;
            });
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