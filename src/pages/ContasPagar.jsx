import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Search, CheckCircle, Trash2, Loader2, Filter, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { contasPagarService } from '@/lib/services/contasPagarService';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { format, parseISO, isPast } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BaixarContaPagarDialog from '@/components/contas-pagar/BaixarContaPagarDialog';
import NovaContaPagarDialog from '@/components/contas-pagar/NovaContaPagarDialog';
import useMediaQuery from '@/hooks/useMediaQuery';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const formatCurrency = value => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(value || 0);

const ContasPagar = () => {
  const {
    contasPagar,
    fornecedores,
    categorias,
    loading: appContextLoading,
    refreshData
  } = useAppContext();
  const [filteredContas, setFilteredContas] = useState([]);
  const [filters, setFilters] = useState({
    busca: '',
    fornecedor: 'all',
    categoria: 'all',
    status: 'all',
    mes: 'all',
    ano: 'all'
  });
  const [loading, setLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [contaToDelete, setContaToDelete] = useState(null);
  const [pagamentoDialog, setPagamentoDialog] = useState({
    open: false,
    conta: null
  });
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { toast } = useToast();

  const availableMonths = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const availableYears = useMemo(() => {
    const years = new Set((contasPagar || []).map(c => format(parseISO(c.data_vencimento), 'yyyy')));
    return Array.from(years).sort().reverse();
  }, [contasPagar]);

  useEffect(() => {
    if (!contasPagar) return;
    let result = contasPagar.map(c => {
      const isAtrasado = c.status === 'pendente' && isPast(new Date(c.data_vencimento + 'T23:59:59'));
      return {
        ...c,
        derivedStatus: c.status === 'pago' ? 'pago' : isAtrasado ? 'atrasado' : 'pendente'
      };
    });
    if (filters.busca) {
      result = result.filter(c => c.descricao.toLowerCase().includes(filters.busca.toLowerCase()) || (c.fornecedor_nome && c.fornecedor_nome.toLowerCase().includes(filters.busca.toLowerCase())));
    }
    if (filters.fornecedor !== 'all') {
      result = result.filter(c => c.fornecedor_id === filters.fornecedor);
    }
    if (filters.categoria !== 'all') {
      result = result.filter(c => c.categoria_id === filters.categoria);
    }
    if (filters.status !== 'all') {
      result = result.filter(c => c.derivedStatus === filters.status);
    }
    if (filters.mes !== 'all') {
      result = result.filter(c => format(parseISO(c.data_vencimento), 'M') === filters.mes);
    }
    if (filters.ano !== 'all') {
      result = result.filter(c => format(parseISO(c.data_vencimento), 'yyyy') === filters.ano);
    }
    setFilteredContas(result);
  }, [contasPagar, filters]);

  const categoriasSaida = useMemo(() => {
    return categorias.raw?.filter(c => c.tipo === 'saida') || [];
  }, [categorias.raw]);

  const handleMarkAsPaid = async pagamentoInfo => {
    setLoading(true);
    try {
      await contasPagarService.marcarComoPaga(pagamentoInfo);
      toast({
        title: "Sucesso!",
        description: "Conta marcada como paga e lançamento criado.",
        className: "bg-emerald-500 text-white"
      });
      await refreshData();
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateConta = async formData => {
    setLoading(true);
    try {
      await contasPagarService.createContaPagar(formData);
      toast({
        title: "Sucesso!",
        description: "Nova conta a pagar criada.",
        className: "bg-emerald-500 text-white"
      });
      await refreshData();
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteRequest = conta => {
    setContaToDelete(conta);
    setConfirmDeleteOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!contaToDelete) return;
    setLoading(true);
    try {
      await contasPagarService.deleteConta(contaToDelete.id);
      toast({
        title: "Sucesso!",
        description: "Conta a pagar removida."
      });
      await refreshData();
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setConfirmDeleteOpen(false);
      setContaToDelete(null);
    }
  };

  const summary = useMemo(() => {
    const totalPendente = filteredContas.filter(c => c.derivedStatus === 'pendente').reduce((sum, c) => sum + Number(c.valor_parcela), 0);
    const totalAtrasado = filteredContas.filter(c => c.derivedStatus === 'atrasado').reduce((sum, c) => sum + Number(c.valor_parcela), 0);
    const totalPago = filteredContas.filter(c => c.derivedStatus === 'pago').reduce((sum, c) => sum + Number(c.valor_pago_efetivo || c.valor_parcela), 0);
    return {
      totalPendente,
      totalAtrasado,
      totalPago
    };
  }, [filteredContas]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pago': return <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Pago</Badge>;
      case 'atrasado': return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">Atrasado</Badge>;
      default: return <Badge variant="warning" className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pendente</Badge>;
    }
  };

  const MobileView = () => (
    <Accordion type="single" collapsible className="w-full">
      {filteredContas.map(conta => (
        <AccordionItem value={conta.id} key={conta.id}>
          <AccordionTrigger>
            <div className="flex justify-between items-center w-full pr-4">
              <div className="text-left">
                <p className="font-medium">{conta.fornecedor_nome || 'N/A'}</p>
                <p className="text-xs text-gray-400">{conta.descricao}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(conta.valor_parcela)}</p>
                <p className="text-xs text-gray-400">{format(parseISO(conta.data_vencimento), 'dd/MM/yy')}</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex justify-between"><span>Status:</span> {getStatusBadge(conta.derivedStatus)}</div>
              <div className="flex justify-end gap-2 pt-2">
                {conta.status === 'pendente' && (
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setPagamentoDialog({ open: true, conta: conta })}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Baixar
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => handleDeleteRequest(conta)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  const DesktopView = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredContas.map(conta => (
            <TableRow key={conta.id}>
              <TableCell className="font-medium">{conta.fornecedor_nome || 'N/A'}</TableCell>
              <TableCell>{conta.descricao}</TableCell>
              <TableCell className="text-right font-semibold">{formatCurrency(conta.valor_parcela)}</TableCell>
              <TableCell>{format(parseISO(conta.data_vencimento), 'dd/MM/yyyy')}</TableCell>
              <TableCell>{getStatusBadge(conta.derivedStatus)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {conta.status === 'pendente' && (
                      <DropdownMenuItem onClick={() => setPagamentoDialog({ open: true, conta: conta })}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Baixar Parcela
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleDeleteRequest(conta)} className="text-red-500">
                      <Trash2 className="mr-2 h-4 w-4" /> Deletar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const FilterContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
      <div className="lg:col-span-2">
          <label className="text-sm font-medium">Buscar Descrição</label>
          <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar..." className="pl-10" value={filters.busca} onChange={e => handleFilterChange('busca', e.target.value)} />
          </div>
      </div>
      <div>
          <label className="text-sm font-medium">Fornecedor</label>
          <Select value={filters.fornecedor} onValueChange={v => handleFilterChange('fornecedor', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">Todos</SelectItem>{fornecedores.map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent>
          </Select>
      </div>
      <div>
          <label className="text-sm font-medium">Categoria</label>
          <Select value={filters.categoria} onValueChange={v => handleFilterChange('categoria', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">Todas</SelectItem>{categoriasSaida.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
          </Select>
      </div>
      <div>
          <label className="text-sm font-medium">Status</label>
          <Select value={filters.status} onValueChange={v => handleFilterChange('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="pendente">Pendente</SelectItem><SelectItem value="pago">Pago</SelectItem><SelectItem value="atrasado">Atrasado</SelectItem></SelectContent>
          </Select>
      </div>
      <div className="flex gap-2">
          <div className="flex-1">
              <label className="text-sm font-medium">Mês</label>
              <Select value={filters.mes} onValueChange={v => handleFilterChange('mes', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">Todos</SelectItem>{availableMonths.map(m => <SelectItem key={m} value={String(m)}>{String(m).padStart(2, '0')}</SelectItem>)}</SelectContent>
              </Select>
          </div>
          <div className="flex-1">
              <label className="text-sm font-medium">Ano</label>
              <Select value={filters.ano} onValueChange={v => handleFilterChange('ano', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">Todos</SelectItem>{availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
          </div>
      </div>
    </div>
  );
  
  if (appContextLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <ArrowLeftRight className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Contas a Pagar</h1>
            <p className="text-sm text-gray-400">Gerencie suas despesas e pagamentos futuros.</p>
          </div>
        </div>
        <NovaContaPagarDialog onConfirm={handleCreateConta} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-effect"><CardContent className="p-4"><p className="text-sm text-gray-400">Total Pendente </p><p className="text-2xl font-bold text-amber-400">{formatCurrency(summary.totalPendente)}</p></CardContent></Card>
        <Card className="glass-effect"><CardContent className="p-4"><p className="text-sm text-gray-400">Total Atrasado</p><p className="text-2xl font-bold text-red-500">{formatCurrency(summary.totalAtrasado)}</p></CardContent></Card>
        <Card className="glass-effect"><CardContent className="p-4"><p className="text-sm text-gray-400">Total Pago (Filtro)</p><p className="text-2xl font-bold text-emerald-400">{formatCurrency(summary.totalPago)}</p></CardContent></Card>
      </div>

      <Card className="glass-effect">
        {isMobile ? (
          <Accordion type="single" collapsible>
            <AccordionItem value="filters">
              <AccordionTrigger className="px-6 py-4">
                <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5" />
                    <CardTitle>Filtros</CardTitle>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-4">
                  <FilterContent />
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5" />
                    <CardTitle>Filtros</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
              <FilterContent />
            </CardContent>
          </>
        )}
      </Card>

      <Card className="glass-effect">
        <CardHeader><CardTitle>Contas</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div> :
            !loading && filteredContas.length === 0 ? <div className="text-center text-gray-400 py-8">Nenhuma conta a pagar encontrada.</div> :
            (isMobile ? <MobileView /> : <DesktopView />)
          }
        </CardContent>
      </Card>

      <BaixarContaPagarDialog open={pagamentoDialog.open} onOpenChange={isOpen => setPagamentoDialog({ ...pagamentoDialog, open: isOpen })} conta={pagamentoDialog.conta} onConfirm={handleMarkAsPaid} />

      <ConfirmationDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen} onConfirm={handleDeleteConfirm} title="Confirmar Exclusão" description="Tem certeza que deseja remover esta conta a pagar? Esta ação não pode ser desfeita." />
    </div>
  );
};
export default ContasPagar;