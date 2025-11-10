import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CalendarIcon, Download, Search, Filter, ChevronDown, ChevronUp, Activity, Users, Database } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useMovimentacoes, RegistroMovimentacao } from '@/hooks/useMovimentacoes';
import { useToast } from '@/hooks/use-toast';

type QuickFilter = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'custom';

export default function RegistroMovimentacoes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<QuickFilter>('this_month');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  const { movimentacoes, loading, filtrarMovimentacoes, exportarMovimentacoes } = useMovimentacoes();
  const { toast } = useToast();

  // Aplicar filtro de mês atual automaticamente ao carregar
  useState(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    setDateFrom(start);
    setDateTo(end);
    filtrarMovimentacoes('', start, end);
  });

  // Filtros rápidos por período
  const applyQuickFilter = (filter: QuickFilter) => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (filter) {
      case 'this_month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'last_month':
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        break;
      case 'last_3_months':
        start = startOfMonth(subMonths(now, 2));
        end = endOfMonth(now);
        break;
      case 'last_6_months':
        start = startOfMonth(subMonths(now, 5));
        end = endOfMonth(now);
        break;
      case 'this_year':
        start = startOfYear(now);
        end = endOfMonth(now);
        break;
      default:
        return;
    }

    setActiveFilter(filter);
    setDateFrom(start);
    setDateTo(end);
    filtrarMovimentacoes(searchTerm, start, end);
  };

  const handleFilter = () => {
    setActiveFilter('custom');
    filtrarMovimentacoes(searchTerm, dateFrom, dateTo);
  };

  const handleExport = async () => {
    try {
      await exportarMovimentacoes(searchTerm, dateFrom, dateTo);
      toast({
        title: "Download iniciado",
        description: "O arquivo CSV está sendo preparado para download",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível gerar o arquivo",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    applyQuickFilter('this_month');
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Estatísticas
  const stats = useMemo(() => {
    const uniqueUsers = new Set(movimentacoes.map(m => m.email_usuario)).size;
    const uniqueTables = new Set(movimentacoes.map(m => m.tabela_afetada).filter(Boolean)).size;
    const totalActions = movimentacoes.length;

    return {
      totalActions,
      uniqueUsers,
      uniqueTables,
    };
  }, [movimentacoes]);

  const getActionBadgeVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('deletar') || lowerAction.includes('remover')) return 'destructive';
    if (lowerAction.includes('criar') || lowerAction.includes('adicionar')) return 'default';
    if (lowerAction.includes('atualizar') || lowerAction.includes('editar')) return 'secondary';
    return 'outline';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              Registro de Movimentações
            </h1>
            <p className="text-muted-foreground mt-2">
              Histórico completo de ações realizadas no sistema para fins de auditoria e transparência
            </p>
          </div>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total de Ações</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" />
                {stats.totalActions}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Usuários Ativos</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                {stats.uniqueUsers}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Tabelas Afetadas</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Database className="w-6 h-6 text-primary" />
                {stats.uniqueTables}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filtros Rápidos por Período */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros Rápidos</CardTitle>
            <CardDescription>Selecione um período para visualizar as movimentações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeFilter === 'this_month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyQuickFilter('this_month')}
              >
                Este Mês
              </Button>
              <Button
                variant={activeFilter === 'last_month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyQuickFilter('last_month')}
              >
                Mês Passado
              </Button>
              <Button
                variant={activeFilter === 'last_3_months' ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyQuickFilter('last_3_months')}
              >
                Últimos 3 Meses
              </Button>
              <Button
                variant={activeFilter === 'last_6_months' ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyQuickFilter('last_6_months')}
              >
                Últimos 6 Meses
              </Button>
              <Button
                variant={activeFilter === 'this_year' ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyQuickFilter('this_year')}
              >
                Este Ano
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtro Personalizado
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filtros Personalizados */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Filtros Personalizados
              </CardTitle>
              <CardDescription>
                Defina critérios específicos para filtrar as movimentações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Buscar por palavra-chave
                  </label>
                  <Input
                    placeholder="Ex: cliente, usuário, deletar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Data inicial
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Data final
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleFilter}>
                  <Search className="w-4 h-4 mr-2" />
                  Aplicar Filtros
                </Button>
                <Button onClick={clearFilters} variant="outline">
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Movimentações */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Histórico de Movimentações</CardTitle>
                <CardDescription className="mt-1">
                  {dateFrom && dateTo && (
                    <>
                      Período: {format(dateFrom, "dd/MM/yyyy", { locale: ptBR })} até {format(dateTo, "dd/MM/yyyy", { locale: ptBR })}
                    </>
                  )}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {movimentacoes.length} registros
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead className="w-[160px]">Data/Hora</TableHead>
                      <TableHead className="w-[200px]">Usuário</TableHead>
                      <TableHead>Ação Realizada</TableHead>
                      <TableHead className="w-[150px]">Tabela</TableHead>
                      <TableHead className="w-[130px]">IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span className="text-muted-foreground">Carregando movimentações...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : movimentacoes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <Activity className="w-12 h-12 text-muted-foreground/50" />
                            <p className="text-muted-foreground font-medium">Nenhuma movimentação encontrada</p>
                            <p className="text-sm text-muted-foreground">
                              Tente ajustar os filtros para ver mais resultados
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      movimentacoes.map((mov) => (
                        <Collapsible key={mov.id} asChild>
                          <>
                            <TableRow className="hover:bg-muted/30 transition-colors">
                              <TableCell>
                                <CollapsibleTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 h-8 w-8"
                                    onClick={() => toggleRowExpansion(mov.id)}
                                  >
                                    {expandedRows.has(mov.id) ? (
                                      <ChevronUp className="w-4 h-4" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {format(new Date(mov.data_hora_acao), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                              </TableCell>
                              <TableCell className="font-medium">
                                {mov.email_usuario}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getActionBadgeVariant(mov.acao_realizada)}>
                                  {mov.acao_realizada}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {mov.tabela_afetada ? (
                                  <code className="text-xs bg-muted px-2 py-1 rounded">
                                    {mov.tabela_afetada}
                                  </code>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {mov.ip_address || '-'}
                              </TableCell>
                            </TableRow>
                            
                            <CollapsibleContent asChild>
                              <TableRow className="bg-muted/20">
                                <TableCell colSpan={6} className="p-4">
                                  <div className="space-y-3">
                                    {mov.dados_anteriores && (
                                      <div>
                                        <p className="text-sm font-semibold mb-2 text-muted-foreground">
                                          Dados Anteriores:
                                        </p>
                                        <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
                                          {JSON.stringify(mov.dados_anteriores, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                    {mov.dados_novos && (
                                      <div>
                                        <p className="text-sm font-semibold mb-2 text-muted-foreground">
                                          Dados Novos:
                                        </p>
                                        <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
                                          {JSON.stringify(mov.dados_novos, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                    {!mov.dados_anteriores && !mov.dados_novos && (
                                      <p className="text-sm text-muted-foreground italic">
                                        Nenhum dado adicional registrado para esta movimentação
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            </CollapsibleContent>
                          </>
                        </Collapsible>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}