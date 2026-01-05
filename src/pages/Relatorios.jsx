import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { lancamentoService } from '@/lib/services/lancamentoService';
import { calculations } from '@/lib/utils/calculations';
import { useToast } from '@/components/ui/use-toast';

function Relatorios() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [yearlyData, setYearlyData] = useState([]);
  const [monthlyComparison, setMonthlyComparison] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadReportData = useCallback(async () => {
    setLoading(true);
    const yearInt = parseInt(selectedYear, 10);
    const allLancamentos = await lancamentoService.getLancamentos();
    const results = calculations.getYearlyResults(allLancamentos, yearInt);
    
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    
    const monthlyData = results.map((result, index) => ({
      mes: monthNames[index],
      entradas: result.entradas,
      saidas: result.saidas,
      lucro: result.lucro
    }));
    
    setYearlyData(monthlyData);
    
    const comparison = monthlyData.map((data, index) => {
      const previousMonth = index > 0 ? monthlyData[index - 1] : null;
      const crescimento = previousMonth && previousMonth.lucro !== 0
        ? ((data.lucro - previousMonth.lucro) / Math.abs(previousMonth.lucro)) * 100
        : (data.lucro !== 0 ? 100 : 0);
      
      return {
        ...data,
        crescimento: isFinite(crescimento) ? crescimento : 0
      };
    });
    
    setMonthlyComparison(comparison);
    
    const totalEntradas = results.reduce((sum, r) => sum + r.entradas, 0);
    const totalSaidas = results.reduce((sum, r) => sum + r.saidas, 0);
    
    setCategoryData([
      { name: 'Entradas', value: totalEntradas, color: '#10b981' },
      { name: 'Saídas', value: totalSaidas, color: '#ef4444' }
    ]);
    setLoading(false);
  }, [selectedYear]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleExportPDF = () => {
    toast({
      title: "🚧 Funcionalidade em desenvolvimento",
      description: "A exportação em PDF será implementada em breve! 🚀"
    });
  };

  const totalEntradas = yearlyData.reduce((sum, data) => sum + data.entradas, 0);
  const totalSaidas = yearlyData.reduce((sum, data) => sum + data.saidas, 0);
  const totalLucro = totalEntradas - totalSaidas;
  const margemLucro = totalEntradas > 0 ? (totalLucro / totalEntradas) * 100 : 0;

  const availableYears = [2022, 2023, 2024, 2025];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient">Relatórios</h1>
          <p className="text-gray-400">Análise detalhada do desempenho financeiro</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedYear} onValueChange={(value) => setSelectedYear(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleExportPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Entradas {selectedYear}</p>
                  <p className="text-2xl font-bold text-emerald-500">{formatCurrency(totalEntradas)}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10"><TrendingUp className="w-6 h-6 text-emerald-500" /></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Saídas {selectedYear}</p>
                  <p className="text-2xl font-bold text-red-500">{formatCurrency(totalSaidas)}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10"><TrendingDown className="w-6 h-6 text-red-500" /></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Lucro {selectedYear}</p>
                  <p className={`text-2xl font-bold ${totalLucro >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrency(totalLucro)}</p>
                </div>
                <div className={`p-3 rounded-lg ${totalLucro >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}><DollarSign className={`w-6 h-6 ${totalLucro >= 0 ? 'text-emerald-500' : 'text-red-500'}`} /></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Margem de Lucro</p>
                  <p className={`text-2xl font-bold ${margemLucro >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{margemLucro.toFixed(1)}%</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10"><Calendar className="w-6 h-6 text-blue-500" /></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="glass-effect">
          <CardHeader><CardTitle>Entradas vs Saídas por Mês - {selectedYear}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="mes" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} formatter={(value) => [formatCurrency(value), '']} />
                  <Bar dataKey="entradas" fill="#10b981" name="Entradas" />
                  <Bar dataKey="saidas" fill="#ef4444" name="Saídas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="glass-effect">
            <CardHeader><CardTitle>Evolução do Lucro</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="mes" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} formatter={(value) => [formatCurrency(value), 'Lucro']} />
                    <Line type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="glass-effect">
            <CardHeader><CardTitle>Distribuição Entradas vs Saídas</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <Card className="glass-effect">
          <CardHeader><CardTitle>Análise de Crescimento Mensal</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4">Mês</th>
                    <th className="text-right py-3 px-4">Entradas</th>
                    <th className="text-right py-3 px-4">Saídas</th>
                    <th className="text-right py-3 px-4">Lucro</th>
                    <th className="text-right py-3 px-4">Crescimento</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyComparison.map((data) => (
                    <tr key={data.mes} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 font-medium">{data.mes}</td>
                      <td className="py-3 px-4 text-right text-emerald-500">{formatCurrency(data.entradas)}</td>
                      <td className="py-3 px-4 text-right text-red-500">{formatCurrency(data.saidas)}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${data.lucro >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrency(data.lucro)}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${data.crescimento >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{data.crescimento >= 0 ? '+' : ''}{data.crescimento.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default Relatorios;