import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');
    
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🖼️ Proxying image request for:', imageUrl);

    // Download the image with proper headers to mimic a browser request
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.instagram.com/',
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch image:', response.status, response.statusText);
      return new Response(JSON.stringify({ error: `Failed to fetch image: ${response.status}` }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the image blob
    const imageBlob = await response.blob();
    
    // Verify it's actually an image
    if (!imageBlob.type.startsWith('image/')) {
      console.error('❌ Response is not an image:', imageBlob.type);
      return new Response(JSON.stringify({ error: 'URL does not point to a valid image' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Successfully proxied image:', imageBlob.type, imageBlob.size, 'bytes');

    // Return the image with appropriate headers
    return new Response(imageBlob, {
      headers: {
        ...corsHeaders,
        'Content-Type': imageBlob.type,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Content-Length': imageBlob.size.toString(),
      },
    });

  } catch (error) {
    console.error('❌ Error in image-proxy function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});