import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AccessLog {
  id: string;
  email_usuario: string;
  data_hora_login: string;
  data_hora_logout: string | null;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
}

interface FilterOptions {
  searchEmail?: string;
  selectedMonth?: string;
  selectedYear?: string;
}

interface Statistics {
  totalAccess: number;
  uniqueUsers: number;
  activeSessions: number;
  averageSessionTime: string;
}

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const calculateSessionTime = (log: AccessLog): string => {
  if (!log.data_hora_logout) return 'Em andamento';
  
  const loginTime = new Date(log.data_hora_login).getTime();
  const logoutTime = new Date(log.data_hora_logout).getTime();
  const diffMinutes = Math.round((logoutTime - loginTime) / (1000 * 60));
  
  if (diffMinutes >= 60) {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return `${hours}h ${mins}min`;
  }
  
  return `${diffMinutes} min`;
};

export const exportToExcel = (logs: AccessLog[], filters: FilterOptions): void => {
  const worksheet = XLSX.utils.json_to_sheet(
    logs.map(log => ({
      'Email': log.email_usuario,
      'Data/Hora Login': formatDateTime(log.data_hora_login),
      'Data/Hora Logout': log.data_hora_logout ? formatDateTime(log.data_hora_logout) : 'Ainda conectado',
      'Status': log.data_hora_logout ? 'Offline' : 'Online',
      'IP': log.ip_address || 'N/A',
      'Navegador': log.user_agent || 'N/A',
      'Tempo de Sessão': calculateSessionTime(log)
    }))
  );

  // Ajustar largura das colunas
  const columnWidths = [
    { wch: 30 }, // Email
    { wch: 20 }, // Data/Hora Login
    { wch: 20 }, // Data/Hora Logout
    { wch: 10 }, // Status
    { wch: 15 }, // IP
    { wch: 25 }, // Navegador
    { wch: 15 }, // Tempo de Sessão
  ];
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs de Acesso');

  // Adicionar folha com estatísticas
  const stats = {
    'Total de Registros': logs.length,
    'Usuários Únicos': new Set(logs.map(l => l.email_usuario)).size,
    'Sessões Ativas': logs.filter(l => !l.data_hora_logout).length,
  };

  const statsSheet = XLSX.utils.json_to_sheet([stats]);
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estatísticas');

  const fileName = `logs_acesso_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportToPDF = (
  logs: AccessLog[], 
  filters: FilterOptions, 
  stats: Statistics
): void => {
  const doc = new jsPDF();

  // Cabeçalho do relatório
  doc.setFontSize(20);
  doc.setTextColor(30, 64, 175); // Azul
  doc.text('Relatório de Logs de Acesso', 14, 20);

  // Linha decorativa
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.line(14, 24, 196, 24);

  // Informações de filtros
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  let yPos = 32;

  if (filters.selectedMonth && filters.selectedYear) {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const monthName = months[parseInt(filters.selectedMonth) - 1];
    doc.text(`Período: ${monthName} de ${filters.selectedYear}`, 14, yPos);
    yPos += 6;
  }

  if (filters.searchEmail) {
    doc.text(`Filtro de Email: ${filters.searchEmail}`, 14, yPos);
    yPos += 6;
  }

  doc.text(`Data de Geração: ${formatDateTime(new Date().toISOString())}`, 14, yPos);
  yPos += 6;
  doc.text(`Total de Registros: ${logs.length}`, 14, yPos);
  yPos += 10;

  // Estatísticas
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text('Estatísticas Resumidas:', 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`• Total de Acessos: ${stats.totalAccess}`, 20, yPos);
  yPos += 6;
  doc.text(`• Usuários Únicos: ${stats.uniqueUsers}`, 20, yPos);
  yPos += 6;
  doc.text(`• Sessões Ativas: ${stats.activeSessions}`, 20, yPos);
  yPos += 6;
  doc.text(`• Tempo Médio de Sessão: ${stats.averageSessionTime}`, 20, yPos);
  yPos += 10;

  // Tabela com dados
  autoTable(doc, {
    head: [['Email', 'Login', 'Logout', 'Status', 'IP', 'Navegador']],
    body: logs.slice(0, 100).map(log => [ // Limitar a 100 registros para não exceder páginas
      log.email_usuario,
      formatDateTime(log.data_hora_login),
      log.data_hora_logout ? formatDateTime(log.data_hora_logout) : '-',
      log.data_hora_logout ? 'Offline' : 'Online',
      log.ip_address || 'N/A',
      (log.user_agent || 'N/A').substring(0, 20) + '...',
    ]),
    startY: yPos,
    styles: { 
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    margin: { top: 10 },
  });

  // Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const fileName = `relatorio_logs_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
