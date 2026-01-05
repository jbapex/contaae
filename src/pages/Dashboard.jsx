import React, { useState, useEffect, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { TrendingUp, TrendingDown, DollarSign, Percent, CalendarClock, AlertTriangle, AlertCircle, ArrowLeftRight } from 'lucide-react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Badge } from '@/components/ui/badge';
    import { dashboardService } from '@/lib/services/dashboardService';
    import OrcamentoAlertCard from '@/components/dashboard/OrcamentoAlertCard';
    import ProjecaoRecebimentosChart from '@/components/dashboard/ProjecaoRecebimentosChart';
    import { useAppContext } from '@/contexts/AppContext';
    import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
    import { ptBR } from 'date-fns/locale';
    import { DateRangePicker } from '@/components/ui/date-range-picker';
    import { Button } from '@/components/ui/button';

    function Dashboard() {
      const { settings } = useAppContext();
      const [dateRange, setDateRange] = useState({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      });
      const [dashboardData, setDashboardData] = useState(null);
      const [loading, setLoading] = useState(true);

      const formatCurrency = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
      
      const loadDashboardData = useCallback(async () => {
        if (!dateRange.from || !dateRange.to) return;
        setLoading(true);
        try {
          const data = await dashboardService.getDashboardData(dateRange);
          setDashboardData(data);
        } catch (error) {
          console.error("Erro ao carregar dados do dashboard:", error);
          setDashboardData(null);
        } finally {
          setLoading(false);
        }
      }, [dateRange]);

      useEffect(() => {
        loadDashboardData();
      }, [loadDashboardData]);

      const handleDateChange = (range) => {
        setDateRange(range);
      }

      if (loading || !dashboardData) {
        return (
          <div className="space-y-6">
             <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gradient">Dashboard</h1>
                  <p className="text-gray-400">Visão geral das suas finanças</p>
                </div>
                <div className="flex items-center gap-2">
                  <DateRangePicker date={dateRange} onDateChange={handleDateChange} />
                  <Button onClick={loadDashboardData} disabled={loading}>
                    {loading ? 'Carregando...' : 'Aplicar'}
                  </Button>
                </div>
              </div>
            </motion.div>
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          </div>
        );
      }
      
      const { kpis, topExpenses, recorrentesStatus, orcamentoAlerts, contasReceber, contasPagarProximas } = dashboardData;

      const stats = [{
        title: 'Entradas no Período',
        value: formatCurrency(kpis.entradas),
        icon: TrendingUp,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10'
      }, {
        title: 'Saídas no Período',
        value: formatCurrency(kpis.saidas),
        icon: TrendingDown,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10'
      }, {
        title: 'Lucro no Período',
        value: formatCurrency(kpis.lucro),
        icon: DollarSign,
        color: kpis.lucro >= 0 ? 'text-emerald-500' : 'text-red-500',
        bgColor: kpis.lucro >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
      }, {
        title: 'Margem de Lucro',
        value: `${kpis.margem.toFixed(1)}%`,
        icon: Percent,
        color: kpis.margem >= 0 ? 'text-emerald-500' : 'text-red-500',
        bgColor: kpis.margem >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
      }];
      
      return (
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gradient">Dashboard</h1>
                <p className="text-gray-400">Visão geral das suas finanças</p>
              </div>
              <div className="flex items-center gap-2">
                <DateRangePicker date={dateRange} onDateChange={handleDateChange} />
                <Button onClick={loadDashboardData} disabled={loading}>
                  {loading ? 'Recarregando...' : 'Aplicar'}
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className="glass-effect hover-scale">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between space-x-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 mb-1 truncate">{stat.title}</p>
                        <p className={`text-xl md:text-2xl font-bold ${stat.color} truncate`}>{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}><stat.icon className={`w-6 h-6 ${stat.color}`} /></div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {settings?.crediario_ativo && contasReceber.length > 0 && 
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <ProjecaoRecebimentosChart contas={contasReceber} />
                </motion.div>}

              {settings?.crediario_ativo && contasPagarProximas.length > 0 &&
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2"><ArrowLeftRight className="w-5 h-5 text-red-400" /><span>Contas a Pagar no Período</span></CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Descrição</TableHead>
                              <TableHead>Vencimento</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {contasPagarProximas.map(conta => (
                              <TableRow key={conta.id}>
                                <TableCell>{conta.descricao}</TableCell>
                                <TableCell>
                                  <Badge variant="warning">{format(parseISO(conta.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold">{formatCurrency(conta.valor_parcela)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              }
              
              <OrcamentoAlertCard alerts={orcamentoAlerts} />
              
            </div>

            <div className="space-y-6 lg:col-span-1">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-xl"><CalendarClock className="w-5 h-5 text-cyan-400" /><span>Recorrências no Período</span></CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-yellow-400"><AlertCircle className="w-4 h-4 mr-2" />Pendentes</span>
                      <span className="font-bold text-lg">{recorrentesStatus.pendentes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-red-500"><AlertTriangle className="w-4 h-4 mr-2" />Atrasados</span>
                      <span className="font-bold text-lg">{recorrentesStatus.atrasados}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card className="glass-effect h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2"><TrendingDown className="w-5 h-5 text-red-500" /><span>Maiores Despesas</span></CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topExpenses.length > 0 ? <ul className="space-y-3">
                        {topExpenses.map(({ categoria, valor }) => <li key={categoria} className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                            <span className="font-medium text-sm md:text-base">{categoria}</span>
                            <span className="font-bold text-red-400">{formatCurrency(valor)}</span>
                          </li>)}
                      </ul> : <div className="text-center py-4 text-gray-400"><p>Nenhuma despesa registrada neste período.</p></div>}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      );
    }

    export default Dashboard;