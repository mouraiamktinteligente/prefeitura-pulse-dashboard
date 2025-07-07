import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, Download, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import { useToast } from '@/hooks/use-toast';

export default function RegistroMovimentacoes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [showFilters, setShowFilters] = useState(false);
  
  const { movimentacoes, loading, filtrarMovimentacoes, exportarMovimentacoes } = useMovimentacoes();
  const { toast } = useToast();

  const handleFilter = () => {
    filtrarMovimentacoes(searchTerm, dateFrom, dateTo);
  };

  const handleExport = async () => {
    try {
      await exportarMovimentacoes(searchTerm, dateFrom, dateTo);
      toast({
        title: "Download iniciado",
        description: "O arquivo está sendo preparado para download",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível gerar o arquivo",
        variant: "destructive"
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom(undefined);
    setDateTo(undefined);
    filtrarMovimentacoes('', undefined, undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">📋</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Registro de Movimentações
              </h1>
              <p className="text-muted-foreground">
                Histórico completo de ações realizadas no sistema
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div></div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
        </div>

        {/* Filtros */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Filtros de Pesquisa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Busca por palavra */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Buscar por palavra-chave
                  </label>
                  <Input
                    placeholder="Ex: pesquisa, cliente, usuário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Data inicial */}
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

                {/* Data final */}
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
                  Filtrar
                </Button>
                <Button onClick={clearFilters} variant="outline">
                  Limpar Filtros
                </Button>
                <Button onClick={handleExport} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de movimentações */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Histórico de Movimentações
              </CardTitle>
              <span className="text-muted-foreground text-sm">
                {movimentacoes.length} registros encontrados
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação Realizada</TableHead>
                    <TableHead>Tabela</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : movimentacoes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Nenhuma movimentação encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    movimentacoes.map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell>
                          {format(new Date(mov.data_hora_acao), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                        </TableCell>
                        <TableCell>{mov.email_usuario}</TableCell>
                        <TableCell>{mov.acao_realizada}</TableCell>
                        <TableCell>{mov.tabela_afetada || '-'}</TableCell>
                        <TableCell>{mov.ip_address || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}