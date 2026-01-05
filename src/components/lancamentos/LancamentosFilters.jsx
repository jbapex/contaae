import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import useMediaQuery from '@/hooks/useMediaQuery';
import { DateRangePicker } from '@/components/ui/date-range-picker';

const LancamentosFilters = ({ filters, setFilters, onApplyFilters }) => {
  const { categorias, clientes, contasBancarias, settings } = useAppContext();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (dateRange) => {
    setFilters(prev => ({...prev, periodo: dateRange}));
  };
  
  const categoriasEntrada = categorias.raw?.filter(c => c.tipo === 'entrada') || [];
  const categoriasSaida = categorias.raw?.filter(c => c.tipo === 'saida') || [];

  const FilterContent = ({ inDialog = false }) => (
    <div className={`grid grid-cols-1 ${inDialog ? '' : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} gap-4 items-end`}>
      <div className={`${inDialog ? '' : 'xl:col-span-2'}`}>
        <label htmlFor="busca" className="text-sm font-medium">Buscar Descrição</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            id="busca" 
            placeholder="Buscar..." 
            className="pl-10" 
            value={filters.busca} 
            onChange={e => handleFilterChange('busca', e.target.value)} 
          />
        </div>
      </div>
      <div>
        <label htmlFor="tipo" className="text-sm font-medium">Tipo</label>
        <Select value={filters.tipo} onValueChange={value => handleFilterChange('tipo', value)}>
          <SelectTrigger id="tipo"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="entrada">Entrada</SelectItem>
            <SelectItem value="saida">Saída</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label htmlFor="categoria" className="text-sm font-medium">Categoria</label>
        <Select value={filters.categoria} onValueChange={value => handleFilterChange('categoria', value)} disabled={filters.tipo === 'todos'}>
          <SelectTrigger id="categoria"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {filters.tipo === 'entrada' && categoriasEntrada.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
            {filters.tipo === 'saida' && categoriasSaida.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label htmlFor="cliente" className="text-sm font-medium">Cliente/Fornecedor</label>
        <Select value={filters.cliente} onValueChange={value => handleFilterChange('cliente', value)}>
          <SelectTrigger id="cliente"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {settings?.contas_bancarias_ativo && (
        <div>
          <label htmlFor="contaBancaria" className="text-sm font-medium">Conta Bancária</label>
          <Select value={filters.contaBancaria} onValueChange={value => handleFilterChange('contaBancaria', value)}>
            <SelectTrigger id="contaBancaria"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {contasBancarias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome_banco}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex flex-col">
        <label htmlFor="periodo" className="text-sm font-medium mb-1">Período</label>
        <DateRangePicker
          id="periodo"
          date={filters.periodo}
          onDateChange={handleDateChange}
          className="w-full"
        />
      </div>
      <div className="flex items-end">
        <Button onClick={onApplyFilters} className="w-full">Aplicar Filtros</Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-base py-6">
                    <Filter className="w-5 h-5 mr-3" />
                    Filtros
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] h-full sm:h-auto flex flex-col glass-effect">
                <DialogHeader>
                    <DialogTitle>Filtros</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2">
                    <FilterContent inDialog={true} />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button className="w-full" onClick={onApplyFilters}>Aplicar Filtros</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <CardTitle>Filtros</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <FilterContent />
      </CardContent>
    </Card>
  );
};

export default LancamentosFilters;