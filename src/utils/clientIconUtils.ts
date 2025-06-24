
import { User, Users, Building, Building2 } from 'lucide-react';

export const getClientIcon = (clientName: string) => {
  const name = clientName.toLowerCase();
  
  // Verifica se é prefeitura
  if (name.includes('prefeitura') || name.includes('município') || name.includes('municipal')) {
    return Building2;
  }
  
  // Verifica se é empresa (palavras comuns em nomes de empresas)
  const empresaKeywords = ['ltda', 'sa', 'eireli', 'me', 'epp', 'empresa', 'comercial', 'indústria', 'serviços', 'tecnologia', 'consultoria'];
  const isEmpresa = empresaKeywords.some(keyword => name.includes(keyword));
  
  if (isEmpresa) {
    return Building;
  }
  
  // Para nomes pessoais, verifica se é feminino ou masculino
  const nomesFemininos = [
    'maria', 'ana', 'francisca', 'antonia', 'adriana', 'juliana', 'marcia', 'fernanda', 
    'patricia', 'aline', 'sandra', 'monica', 'andrea', 'rosana', 'claudia', 'simone',
    'carla', 'rita', 'lucia', 'vera', 'sonia', 'regina', 'cristina', 'angela',
    'isabel', 'helena', 'beatriz', 'gabriela', 'roberta', 'camila', 'amanda', 'jessica',
    'bruna', 'larissa', 'vanessa', 'priscila', 'daniela', 'renata', 'sabrina'
  ];
  
  const primeiroNome = name.split(' ')[0];
  const isFeminino = nomesFemininos.some(nome => primeiroNome.includes(nome));
  
  // Se não conseguir determinar especificamente, usa ícone genérico
  return isFeminino ? User : Users;
};
