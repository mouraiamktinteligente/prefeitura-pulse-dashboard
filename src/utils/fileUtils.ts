
/**
 * Utility functions for file operations
 */

export const sanitizeFileName = (fileName: string): string => {
  // Remove caracteres especiais e espaços, mantém apenas letras, números, pontos e hífens
  return fileName
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
};

export const detectFileType = (file: File): string => {
  if (file.type.includes('pdf')) return 'PDF';
  if (file.type.includes('text')) return 'TXT';
  if (file.type.includes('image')) return 'Imagem';
  return 'Outros';
};

export const generateReadableFileName = (originalName: string): string => {
  // Sanitizar nome original
  const sanitized = sanitizeFileName(originalName);
  
  // Separar nome e extensão
  const lastDotIndex = sanitized.lastIndexOf('.');
  const nameWithoutExt = lastDotIndex > 0 ? sanitized.substring(0, lastDotIndex) : sanitized;
  const extension = lastDotIndex > 0 ? sanitized.substring(lastDotIndex) : '';
  
  // Adicionar timestamp para evitar conflitos
  const timestamp = Date.now();
  
  return `${nameWithoutExt}_${timestamp}${extension}`;
};

export const generateUniqueFileName = (originalName: string): string => {
  // Manter compatibilidade com código existente
  return generateReadableFileName(originalName);
};
