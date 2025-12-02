/**
 * Utilitários para processamento de URLs de vídeo
 * Suporta: YouTube (normal, shorts, embed, youtu.be), Vimeo, e iframes genéricos
 */

export interface VideoInfo {
  type: 'youtube' | 'vimeo' | 'iframe' | 'unknown';
  videoId: string | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
}

/**
 * Extrai informações de vídeo de uma URL
 * Suporta múltiplos formatos do YouTube incluindo Shorts
 */
export function parseVideoUrl(url?: string): VideoInfo {
  if (!url) {
    return { type: 'unknown', videoId: null, embedUrl: null, thumbnailUrl: null };
  }

  const trimmedUrl = url.trim();

  // Caso 1: É um iframe completo - extrair src
  if (trimmedUrl.includes('<iframe')) {
    const srcMatch = trimmedUrl.match(/src=["']([^"']+)["']/i);
    if (srcMatch) {
      // Recursivamente parsear a URL do src
      return parseVideoUrl(srcMatch[1]);
    }
    return { type: 'iframe', videoId: null, embedUrl: null, thumbnailUrl: null };
  }

  // Caso 2: YouTube - vários formatos
  const youtubePatterns = [
    // youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // youtube.com/shorts/VIDEO_ID
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    // youtu.be/VIDEO_ID
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // youtube.com/embed/VIDEO_ID
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // youtube.com/v/VIDEO_ID
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    // youtube-nocookie.com/embed/VIDEO_ID
    /(?:youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of youtubePatterns) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      const videoId = match[1];
      return {
        type: 'youtube',
        videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      };
    }
  }

  // Caso 3: Vimeo
  const vimeoPatterns = [
    // vimeo.com/VIDEO_ID
    /vimeo\.com\/(\d+)/,
    // player.vimeo.com/video/VIDEO_ID
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of vimeoPatterns) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      const videoId = match[1];
      return {
        type: 'vimeo',
        videoId,
        embedUrl: `https://player.vimeo.com/video/${videoId}`,
        thumbnailUrl: null, // Vimeo requer API para thumbnail
      };
    }
  }

  // Caso 4: URL já é um embed válido
  if (
    trimmedUrl.includes('youtube.com/embed/') ||
    trimmedUrl.includes('player.vimeo.com/video/')
  ) {
    return {
      type: trimmedUrl.includes('youtube') ? 'youtube' : 'vimeo',
      videoId: null,
      embedUrl: trimmedUrl,
      thumbnailUrl: null,
    };
  }

  return { type: 'unknown', videoId: null, embedUrl: null, thumbnailUrl: null };
}

/**
 * Retorna URL de embed pronta para uso em iframe
 * Wrapper simples para parseVideoUrl
 */
export function getEmbedUrl(url?: string): string | null {
  const { embedUrl } = parseVideoUrl(url);
  return embedUrl;
}

/**
 * Verifica se uma URL é um vídeo válido suportado
 */
export function isValidVideoUrl(url?: string): boolean {
  if (!url) return false;
  const { type } = parseVideoUrl(url);
  return type !== 'unknown';
}

/**
 * Extrai thumbnail do YouTube (quando disponível)
 */
export function getYoutubeThumbnail(
  url?: string,
  quality: 'default' | 'medium' | 'high' | 'maxres' = 'maxres'
): string | null {
  const { type, videoId } = parseVideoUrl(url);
  
  if (type !== 'youtube' || !videoId) return null;

  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault',
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}
