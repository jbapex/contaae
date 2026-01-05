import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, TrendingUp, TrendingDown, DollarSign, Loader2 } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { lancamentoService } from '@/lib/services/lancamentoService';
import { cashflowCalculations } from '@/lib/utils/cashflow';
import { startOfMonth, endOfMonth, subDays } from 'date-fns';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-lg shadow-lg text-white">
        <p className="label font-bold text-lg">{`${label}`}</p>
        <p className="text-emerald-400">{`Entradas: ${formatCurrency(payload[0].value)}`}</p>
        <p className="text-red-400">{`Saídas: ${formatCurrency(payload[1].value)}`}</p>
        <p className="text-cyan-400">{`Saldo Acumulado: ${formatCurrency(payload[2].value)}`}</p>
      </div>
    );
  }
  return null;
};

function FluxoDeCaixa() {
  const [period, setPeriod] = useState('30d');
  const [dateRange, setDateRange] = useState({ from: subDays(new Date(), 29), to: new Date() });
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({ totalEntradas: 0, totalSaidas: 0, saldoFinal: 0 });
  const [loading, setLoading] = useState(true);

  const handlePeriodChange = (value) => {
    setPeriod(value);
    const today = new Date();
    let fromDate;
    switch (value) {
      case '7d':
        fromDate = subDays(today, 6);
        break;
      case '15d':
        fromDate = subDays(today, 14);
        break;
      case 'month':
        fromDate = startOfMonth(today);
        break;
      case '30d':
      default:
        fromDate = subDays(today, 29);
        break;
    }
    if (value !== 'custom') {
      setDateRange({ from: fromDate, to: today });
    }
  };

  const loadData = useCallback(async () => {
    if (!dateRange.from || !dateRange.to) return;
    setLoading(true);
    try {
      const allLancamentos = await lancamentoService.getLancamentos();
      const { data, summary } = cashflowCalculations.processCashflow(allLancamentos, dateRange.from, dateRange.to);
      setChartData(data);
      setSummary(summary);
    } catch (error) {
      console.error("Erro ao carregar dados do fluxo de caixa:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summaryCards = [
    { title: 'Total de Entradas', value: formatCurrency(summary.totalEntradas), icon: TrendingUp, color: 'text-emerald-500' },
    { title: 'Total de Saídas', value: formatCurrency(summary.totalSaidas), icon: TrendingDown, color: 'text-red-500' },
    { title: 'Saldo Final', value: formatCurrency(summary.saldoFinal), icon: DollarSign, color: summary.saldoFinal >= 0 ? 'text-emerald-500' : 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center space-x-3">
          <AreaChart className="w-10 h-10 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold text-gradient">Fluxo de Caixa</h1>
            <p className="text-gray-400">Acompanhe a evolução do seu saldo ao longo do tempo.</p>
          </div>
        </div>
      </motion.div>

      <Card className="glass-effect">
        <CardContent className="p-6 flex flex-wrap items-center gap-4">
          <div className="flex-grow">
            <label className="text-sm text-gray-400 mb-2 block">Período</label>
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="15d">Últimos 15 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="month">Mês Atual</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {period === 'custom' && (
            <>
              <div className="flex-grow">
                <label className="text-sm text-gray-400 mb-2 block">Data Inicial</label>
                <DatePicker date={dateRange.from} setDate={(d) => setDateRange(prev => ({ ...prev, from: d }))} />
              </div>
              <div className="flex-grow">
                <label className="text-sm text-gray-400 mb-2 block">Data Final</label>
                <DatePicker date={dateRange.to} setDate={(d) => setDateRange(prev => ({ ...prev, to: d }))} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (index + 1) }}>
              <Card className="glass-effect">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{card.title}</p>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${card.color.replace('text-', 'bg-')}/10`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Gráfico Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
            ) : (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="label" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" tickFormatter={formatCurrency} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <ReferenceLine y={0} stroke="#7f8c8d" strokeDasharray="3 3" />
                    <Bar dataKey="entradas" fill="#10b981" name="Entradas" barSize={20} />
                    <Bar dataKey="saidas" fill="#ef4444" name="Saídas" barSize={20} />
                    <Line type="monotone" dataKey="saldoAcumulado" stroke="#06b6d4" strokeWidth={3} name="Saldo Acumulado" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default FluxoDeCaixa;