
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
  // Preservar nome original exatamente como enviado pelo usuário
  return originalName;
};

export const generateUniqueFileName = (originalName: string): string => {
  // Manter compatibilidade com código existente - preserva nome original
  return originalName;
};

// Função para normalizar nomes para comparação (remove acentos e caracteres especiais)
export const normalizeForComparison = (name: string): string => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ''); // Remove tudo que não é letra ou número
};
