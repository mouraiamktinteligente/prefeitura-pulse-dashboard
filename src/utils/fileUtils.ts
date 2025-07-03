
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

export const generateUniqueFileName = (originalName: string): string => {
  const sanitizedName = sanitizeFileName(originalName);
  const timestamp = Date.now();
  return `${timestamp}_${sanitizedName}`;
};
