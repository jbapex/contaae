import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, PlusCircle, Edit, Trash2, MoreHorizontal, Loader2, PieChart, CheckCircle, AlertCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { pagamentoRecorrenteService } from '@/lib/services/pagamentoRecorrenteService';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ConfirmationDialog from '@/components/ConfirmationDialog';
import PagamentoRecorrenteForm from '@/components/pagamentos/PagamentoRecorrenteForm';
import { Pie, ResponsiveContainer, Cell, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f97316', '#ef4444', '#f59e0b'];

const getStatusInfo = (status, dataVencimento) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vencimento = new Date(dataVencimento);
  vencimento.setHours(0,0,0,0);
  vencimento.setDate(vencimento.getDate() + 1); // Ajuste de fuso horário

  switch (status) {
    case 'pago':
      return { icon: <CheckCircle className="w-4 h-4 mr-1 text-green-500" />, text: 'Pago', variant: 'success' };
    case 'atrasado':
      const diasAtraso = Math.floor((hoje - vencimento) / (1000 * 60 * 60 * 24));
      return { icon: <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />, text: `Atrasado (${diasAtraso}d)`, variant: 'destructive' };
    case 'pendente':
      return { icon: <AlertCircle className="w-4 h-4 mr-1 text-yellow-500" />, text: 'Pendente', variant: 'warning' };
    default:
      return { icon: null, text: '', variant: 'default' };
  }
};

const PagamentosRecorrentes = () => {
  const [pagamentos, setPagamentos] = useState([]);
  const [instancias, setInstancias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPagamento, setSelectedPagamento] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pagamentoToDelete, setPagamentoToDelete] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pagamentosData, instanciasData] = await Promise.all([
        pagamentoRecorrenteService.getPagamentosRecorrentes(),
        pagamentoRecorrenteService.getInstanciasDoMes(currentDate.getFullYear(), currentDate.getMonth())
      ]);
      setPagamentos(pagamentosData);
      setInstancias(instanciasData);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível carregar os dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, currentDate]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await pagamentoRecorrenteService.gerarInstanciasFaltantes();
      await loadData();
      toast({ title: "Sucesso!", description: "Pagamentos sincronizados e atualizados." });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao sincronizar pagamentos.", variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async (data) => {
    try {
      await pagamentoRecorrenteService.savePagamentoRecorrente(data);
      toast({ title: "Sucesso!", description: `Pagamento ${data.id ? 'atualizado' : 'criado'} com sucesso.` });
      loadData();
    } catch (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };
  
  const handleDelete = (pagamento) => {
    setPagamentoToDelete(pagamento);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pagamentoToDelete) return;
    try {
      await pagamentoRecorrenteService.deletePagamentoRecorrente(pagamentoToDelete.id);
      toast({ title: "Sucesso!", description: "Pagamento recorrente deletado." });
      loadData();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível deletar.", variant: "destructive" });
    } finally {
      setIsConfirmOpen(false);
      setPagamentoToDelete(null);
    }
  };
  
  const handleEdit = (pagamento) => {
    setSelectedPagamento(pagamento);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedPagamento(null);
    setIsFormOpen(true);
  };

  const handleMarcarComoPago = async (instanciaId) => {
    try {
      await pagamentoRecorrenteService.marcarComoPago(instanciaId);
      toast({ title: "Sucesso!", description: "Pagamento marcado como pago." });
      loadData();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível marcar como pago.", variant: "destructive" });
    }
  };

  const chartData = useMemo(() => {
    const data = instancias.reduce((acc, p) => {
        const cat = p.categoria_nome || 'Sem Categoria';
        acc[cat] = (acc[cat] || 0) + Number(p.valor);
        return acc;
    }, {});
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [instancias]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <CalendarClock className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Pagamentos Recorrentes</h1>
            <p className="text-sm text-gray-400">Automatize e organize suas despesas fixas.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 self-end sm:self-center">
          <Button onClick={handleSync} variant="outline" size="sm" disabled={isSyncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sinc.
          </Button>
          <Button onClick={handleAddNew} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Novo</Button>
        </div>
      </motion.div>

      <Tabs defaultValue="mes-atual">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mes-atual">Pagamentos do Mês</TabsTrigger>
          <TabsTrigger value="modelos">Modelos de Pagamento</TabsTrigger>
        </TabsList>
        <TabsContent value="mes-atual" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="glass-effect lg:col-span-2">
              <CardHeader>
                <CardTitle>Pagamentos de {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>
                : <div className="hidden sm:block">
                  <Table>
                    <TableHeader><TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {instancias.map((i) => {
                        const statusInfo = getStatusInfo(i.status, i.data_vencimento);
                        return (
                          <TableRow key={i.id}>
                            <TableCell className="font-medium">{i.nome}</TableCell>
                            <TableCell>{new Date(i.data_vencimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                            <TableCell>{formatCurrency(i.valor)}</TableCell>
                            <TableCell><Badge variant={statusInfo.variant}>{statusInfo.icon}{statusInfo.text}</Badge></TableCell>
                            <TableCell className="text-right">
                              {i.status !== 'pago' && (
                                <Button size="sm" onClick={() => handleMarcarComoPago(i.id)}>Pagar</Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                </Table>
                </div>
                }
                <div className="sm:hidden space-y-4">
                  {instancias.map(i => {
                    const statusInfo = getStatusInfo(i.status, i.data_vencimento);
                    return (
                      <Card key={i.id} className="bg-slate-800/50">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <p className="font-bold">{i.nome}</p>
                            <Badge variant={statusInfo.variant}>{statusInfo.icon}{statusInfo.text}</Badge>
                          </div>
                          <p className="text-gray-400">Vencimento: {new Date(i.data_vencimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                          <div className="flex justify-between items-center">
                            <p className="text-lg font-semibold text-emerald-400">{formatCurrency(i.valor)}</p>
                            {i.status !== 'pago' && (
                              <Button size="sm" onClick={() => handleMarcarComoPago(i.id)}>Pagar</Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
                <CardDescription>Distribuição dos pagamentos do mês.</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="modelos" className="mt-6">
          <Card className="glass-effect">
            <CardHeader><CardTitle>Modelos de Pagamento</CardTitle><CardDescription>Estes são os modelos que geram os pagamentos mensais/semanais.</CardDescription></CardHeader>
            <CardContent>
              {loading ? <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>
              : 
              <div className="overflow-x-auto">
                <Table>
                    <TableHeader><TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Frequência</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                        {pagamentos.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell className="font-medium">{p.nome}</TableCell>
                                <TableCell>{formatCurrency(p.valor)}</TableCell>
                                <TableCell>{p.frequencia === 'mensal' ? `Todo dia ${p.dia_vencimento}` : `Toda ${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][p.dia_vencimento]}`}</TableCell>
                                <TableCell><Badge variant={p.ativo ? 'default' : 'secondary'}>{p.ativo ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(p)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(p)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Deletar</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
              </div>
              }
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PagamentoRecorrenteForm open={isFormOpen} setOpen={setIsFormOpen} pagamento={selectedPagamento} onSave={handleSave} />
      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o modelo de pagamento recorrente "${pagamentoToDelete?.nome}"? Todas as futuras cobranças baseadas nele serão canceladas.`}
      />
    </div>
  );
};

export default PagamentosRecorrentes;