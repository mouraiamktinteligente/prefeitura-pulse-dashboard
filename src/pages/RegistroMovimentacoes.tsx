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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Registro de Movimentações
            </h1>
            <p className="text-blue-300">
              Histórico completo de ações realizadas no sistema
            </p>
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="text-blue-300 border-blue-400 hover:bg-blue-700"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
        </div>

        {/* Filtros */}
        {showFilters && (
          <Card className="bg-blue-800/50 border-blue-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Filtros de Pesquisa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Busca por palavra */}
                <div className="space-y-2">
                  <label className="text-blue-300 text-sm font-medium">
                    Buscar por palavra-chave
                  </label>
                  <Input
                    placeholder="Ex: pesquisa, cliente, usuário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-blue-900/50 border-blue-600 text-white placeholder-blue-400"
                  />
                </div>

                {/* Data inicial */}
                <div className="space-y-2">
                  <label className="text-blue-300 text-sm font-medium">
                    Data inicial
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-blue-900/50 border-blue-600",
                          !dateFrom && "text-blue-400"
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
                  <label className="text-blue-300 text-sm font-medium">
                    Data final
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-blue-900/50 border-blue-600",
                          !dateTo && "text-blue-400"
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
                <Button onClick={handleFilter} className="bg-blue-600 hover:bg-blue-700">
                  <Search className="w-4 h-4 mr-2" />
                  Filtrar
                </Button>
                <Button onClick={clearFilters} variant="outline" className="border-blue-400 text-blue-300">
                  Limpar Filtros
                </Button>
                <Button onClick={handleExport} variant="outline" className="border-green-400 text-green-300">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de movimentações */}
        <Card className="bg-blue-800/50 border-blue-600">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">
                Histórico de Movimentações
              </CardTitle>
              <span className="text-blue-300 text-sm">
                {movimentacoes.length} registros encontrados
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-600">
                    <TableHead className="text-blue-300">Data/Hora</TableHead>
                    <TableHead className="text-blue-300">Usuário</TableHead>
                    <TableHead className="text-blue-300">Ação Realizada</TableHead>
                    <TableHead className="text-blue-300">Tabela</TableHead>
                    <TableHead className="text-blue-300">IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-blue-300 py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : movimentacoes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-blue-300 py-8">
                        Nenhuma movimentação encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    movimentacoes.map((mov) => (
                      <TableRow key={mov.id} className="border-blue-700 hover:bg-blue-700/50">
                        <TableCell className="text-white">
                          {format(new Date(mov.data_hora_acao), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-white">{mov.email_usuario}</TableCell>
                        <TableCell className="text-white">{mov.acao_realizada}</TableCell>
                        <TableCell className="text-blue-300">{mov.tabela_afetada || '-'}</TableCell>
                        <TableCell className="text-blue-300">{mov.ip_address || '-'}</TableCell>
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