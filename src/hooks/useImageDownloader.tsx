import { useState, useEffect, useRef } from 'react';

interface UseImageDownloaderReturn {
  localImageUrl: string | null;
  isDownloading: boolean;
  downloadError: string | null;
}

interface CachedImage {
  url: string;
  postId: string;
  blobUrl: string;
  timestamp: number;
}

// Cache global para reutilizar imagens entre componentes
const imageCache = new Map<string, CachedImage>();

// Função para converter links do Google Drive para formato visualizável
const convertGoogleDriveUrl = (url: string): string => {
  // Detectar se é um link do Google Drive no formato /file/d/{id}/view
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    // Converter para o formato direto: https://drive.google.com/uc?id={id}
    return `https://drive.google.com/uc?id=${fileId}`;
  }
  return url;
};

export const useImageDownloader = (
  imageUrl: string | null | undefined,
  postId: string | null | undefined
): UseImageDownloaderReturn => {
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Limpar estados quando não há URL
    if (!imageUrl || !postId) {
      setLocalImageUrl(null);
      setIsDownloading(false);
      setDownloadError(null);
      return;
    }

    // Verificar cache primeiro
    const cached = imageCache.get(postId);
    if (cached && cached.url === imageUrl) {
      console.log('🎯 Usando imagem do cache:', postId);
      setLocalImageUrl(cached.blobUrl);
      setIsDownloading(false);
      setDownloadError(null);
      return;
    }

    // Cancelar download anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const downloadImage = async () => {
      setIsDownloading(true);
      setDownloadError(null);
      
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        // Converter URL do Google Drive se necessário
        const convertedUrl = convertGoogleDriveUrl(imageUrl);
        console.log('📥 Iniciando download da imagem via proxy:', convertedUrl);

        // Use the Supabase Edge Function as proxy to bypass CORS
        const proxyUrl = `https://oztosavtfiifjaahpagf.supabase.co/functions/v1/image-proxy?url=${encodeURIComponent(convertedUrl)}`;
        
        const response = await fetch(proxyUrl, {
          signal: abortController.signal,
          headers: {
            'Accept': 'image/*'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        
        // Verificar se é uma imagem válida
        if (!blob.type.startsWith('image/')) {
          throw new Error('Arquivo baixado não é uma imagem válida');
        }

        const blobUrl = URL.createObjectURL(blob);
        
        // Limpar blob URL anterior do cache se existir
        if (cached) {
          URL.revokeObjectURL(cached.blobUrl);
        }

        // Atualizar cache
        imageCache.set(postId, {
          url: imageUrl,
          postId,
          blobUrl,
          timestamp: Date.now()
        });

        setLocalImageUrl(blobUrl);
        setIsDownloading(false);
        
        console.log('✅ Imagem baixada e cached com sucesso:', postId);

      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('⏹️ Download cancelado:', postId);
          return;
        }

        console.error('❌ Erro ao baixar imagem:', error);
        setDownloadError(error instanceof Error ? error.message : 'Erro desconhecido');
        setIsDownloading(false);
        setLocalImageUrl(null);
      }
    };

    downloadImage();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [imageUrl, postId]);

  // Cleanup de blob URLs quando o componente for desmontado
  useEffect(() => {
    return () => {
      // Não limpar o cache aqui pois pode ser reutilizado por outros componentes
      // A limpeza do cache será feita em um timeout ou quando necessário
    };
  }, []);

  return {
    localImageUrl,
    isDownloading,
    downloadError
  };
};

// Função utilitária para limpar cache antigo (opcional)
export const cleanupImageCache = (maxAge: number = 30 * 60 * 1000) => { // 30 minutos
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  imageCache.forEach((cached, key) => {
    if (now - cached.timestamp > maxAge) {
      URL.revokeObjectURL(cached.blobUrl);
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => imageCache.delete(key));
  
  if (keysToDelete.length > 0) {
    console.log(`🧹 Cache limpo: ${keysToDelete.length} imagens removidas`);
  }
};