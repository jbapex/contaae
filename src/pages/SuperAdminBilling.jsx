import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Users, LineChart, CheckCircle, Clock, Download } from 'lucide-react';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import { billingService } from '@/lib/services/billingService';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon }) => (
  <Card className="glass-effect border-white/20">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{value}</div>
    </CardContent>
  </Card>
);

const SuperAdminBilling = () => {
  const [stats, setStats] = useState({});
  const [invoices, setInvoices] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, invoicesData, chartData] = await Promise.all([
          billingService.getBillingStats(),
          billingService.getAllInvoices(),
          billingService.getMonthlyRevenue()
        ]);
        setStats(statsData);
        setInvoices(invoicesData);
        setChartData(chartData);
      } catch (error) {
        toast({ title: 'Erro ao carregar dados de faturamento', description: error.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const filteredInvoices = useMemo(() => {
    if (statusFilter === 'all') return invoices;
    return invoices.filter(invoice => invoice.status === statusFilter);
  }, [invoices, statusFilter]);

  const handleUpdateStatus = async (invoiceId, status) => {
    try {
      await billingService.updateInvoiceStatus(invoiceId, status);
      toast({ title: 'Sucesso!', description: 'Status da fatura atualizado.', className: 'bg-green-500 text-white' });
      const invoicesData = await billingService.getAllInvoices();
      setInvoices(invoicesData);
    } catch (error) {
      toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid': return <Badge variant="success"><CheckCircle className="mr-1 h-3 w-3" />Pago</Badge>;
      case 'due': return <Badge variant="warning"><Clock className="mr-1 h-3 w-3" />Pendente</Badge>;
      case 'overdue': return <Badge variant="destructive">Atrasado</Badge>;
      case 'canceled': return <Badge variant="secondary">Cancelado</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Faturamento</h1>
        <p className="text-gray-400">Visão geral da saúde financeira da plataforma.</p>
      </div>

      {loading ? (
        <div className="text-center py-16">Carregando...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Receita Mês Atual" value={`R$ ${stats.currentMonthRevenue?.toFixed(2) || '0.00'}`} icon={<DollarSign className="h-4 w-4 text-gray-400" />} />
            <StatCard title="Receita Total" value={`R$ ${stats.totalRevenue?.toFixed(2) || '0.00'}`} icon={<DollarSign className="h-4 w-4 text-gray-400" />} />
            <StatCard title="Usuários Pagantes" value={stats.activePayingUsers || 0} icon={<Users className="h-4 w-4 text-gray-400" />} />
            <StatCard title="Ticket Médio" value={`R$ ${stats.averageTicket?.toFixed(2) || '0.00'}`} icon={<LineChart className="h-4 w-4 text-gray-400" />} />
          </div>

          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle>Receita Mensal (Últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <RechartsLineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => `R$${value}`} fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff' }} />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                  <Line type="monotone" dataKey="Receita" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Faturas Detalhadas</CardTitle>
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="due">Pendente</SelectItem>
                      <SelectItem value="overdue">Atrasado</SelectItem>
                      <SelectItem value="canceled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" className="flex-shrink-0">
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Exportar CSV</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-800/20">
                      <TableHead className="text-white">Usuário</TableHead>
                      <TableHead className="text-white hidden md:table-cell">Plano</TableHead>
                      <TableHead className="text-white">Valor</TableHead>
                      <TableHead className="text-white hidden sm:table-cell">Vencimento</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="border-slate-800 hover:bg-slate-800/20">
                        <TableCell className="max-w-[15ch] truncate">{invoice.users.email}</TableCell>
                        <TableCell className="hidden md:table-cell">{invoice.plans.name}</TableCell>
                        <TableCell>R$ {invoice.amount.toFixed(2)}</TableCell>
                        <TableCell className="hidden sm:table-cell">{format(new Date(invoice.due_date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          {invoice.status === 'due' && (
                            <Button size="sm" onClick={() => handleUpdateStatus(invoice.id, 'paid')}>Marcar Pago</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SuperAdminBilling;