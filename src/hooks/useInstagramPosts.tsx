import { useState, useEffect } from 'react';

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
        
        const SUPABASE_URL = "https://oztosavtfiifjaahpagf.supabase.co";
        const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96dG9zYXZ0ZmlpZmphYWhwYWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDQ3MzcsImV4cCI6MjA2NTkyMDczN30.xA7EL74ACsIXCkKRoHESvKHldFjV_kjBCH6onsODHMs";
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/instagram_posts?profile=eq.${encodeURIComponent(profile)}&order=created_at.desc&limit=1`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.length > 0) {
          setLatestPost(data[0]);
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
  }, [profile]);

  return { latestPost, loading, error };
};