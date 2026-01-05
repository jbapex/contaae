import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, Edit, Save, Loader2, CheckCircle, AlertTriangle, XCircle, BarChart2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { orcamentoService } from '@/lib/services/orcamentoService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const formatCurrency = (value) => {
    if (typeof value !== 'number') {
        value = 0;
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const StatusBadge = ({ realizado, meta, tipo }) => {
  if (meta === 0 || !meta) return <Badge variant="secondary">Sem meta</Badge>;
  const percentual = (realizado / meta) * 100;

  if (tipo === 'despesa') {
      if (percentual > 100) {
        return <Badge variant="destructive" className="flex items-center"><XCircle className="w-3 h-3 mr-1" /> Estourou</Badge>;
      }
      if (percentual >= 80) {
        return <Badge className="bg-amber-500 hover:bg-amber-600 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> Próximo</Badge>;
      }
      return <Badge className="bg-emerald-500 hover:bg-emerald-600 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> OK</Badge>;
  }

  // tipo === 'receita'
  if (percentual >= 100) {
    return <Badge className="bg-emerald-500 hover:bg-emerald-600 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Atingido</Badge>;
  }
  if (percentual >= 80) {
    return <Badge className="bg-cyan-500 hover:bg-cyan-600 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> Quase lá</Badge>;
  }
  return <Badge variant="outline">Em andamento</Badge>;
};


const PlanejamentoOrcamentario = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [orcamentoData, setOrcamentoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [columnVisibility, setColumnVisibility] = useState({
    meta: true,
    realizado: true,
    status: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orcamentoService.getOrcamentoCompleto(currentDate);
      setOrcamentoData(data);
    } catch (error) {
      toast({ title: 'Erro ao carregar dados', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [currentDate, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMonthChange = (increment) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1); // Evita bugs com meses de diferentes durações
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };

  const handleInputChange = (id, field, value) => {
    const numericValue = parseFloat(value.replace(/[^0-9]/g, '')) / 100 || 0;
    setOrcamentoData(prevData =>
      prevData.map(item =>
        item.categoria_id === id ? { ...item, [field]: numericValue } : item
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await orcamentoService.saveOrcamento(orcamentoData, currentDate);
      toast({ title: 'Sucesso!', description: 'Orçamento salvo com sucesso.', className: 'bg-emerald-600 text-white' });
      setIsEditing(false);
      loadData();
    } catch (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const { summary, chartData } = useMemo(() => {
    const totalMetaReceita = orcamentoData.reduce((sum, item) => sum + (item.meta_receita || 0), 0);
    const totalRealizadoReceita = orcamentoData.reduce((sum, item) => sum + (item.realizado_receita || 0), 0);
    const totalMetaDespesa = orcamentoData.reduce((sum, item) => sum + (item.meta_despesa || 0), 0);
    const totalRealizadoDespesa = orcamentoData.reduce((sum, item) => sum + (item.realizado_despesa || 0), 0);

    const filteredChartData = orcamentoData
      .filter(d => d.meta_receita > 0 || d.realizado_receita > 0 || d.meta_despesa > 0 || d.realizado_despesa > 0)
      .map(d => ({
        name: d.categoria_nome,
        'Meta Receita': d.meta_receita,
        'Receita Realizada': d.realizado_receita,
        'Meta Despesa': d.meta_despesa,
        'Despesa Realizada': d.realizado_despesa,
      }));

    return {
      summary: {
        totalMetaReceita,
        totalRealizadoReceita,
        totalMetaDespesa,
        totalRealizadoDespesa,
      },
      chartData: filteredChartData
    };
  }, [orcamentoData]);

  return (
    <div className="space-y-6 overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Target className="w-10 h-10 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold text-gradient">Planejamento Orçamentário</h1>
              <p className="text-gray-400">Defina e acompanhe suas metas financeiras mensais.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" onClick={() => handleMonthChange(-1)}>Anterior</Button>
             <span className="font-bold text-lg w-40 text-center capitalize">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</span>
             <Button variant="outline" onClick={() => handleMonthChange(1)}>Próximo</Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-effect"><CardContent className="p-4"><p className="text-sm text-gray-400">Meta Receitas</p><p className="text-2xl font-bold">{formatCurrency(summary.totalMetaReceita)}</p></CardContent></Card>
        <Card className="glass-effect"><CardContent className="p-4"><p className="text-sm text-gray-400">Receitas Realizadas</p><p className={`text-2xl font-bold ${summary.totalRealizadoReceita >= summary.totalMetaReceita && summary.totalMetaReceita > 0 ? 'text-emerald-400' : 'text-white'}`}>{formatCurrency(summary.totalRealizadoReceita)}</p></CardContent></Card>
        <Card className="glass-effect"><CardContent className="p-4"><p className="text-sm text-gray-400">Meta Despesas</p><p className="text-2xl font-bold">{formatCurrency(summary.totalMetaDespesa)}</p></CardContent></Card>
        <Card className="glass-effect"><CardContent className="p-4"><p className="text-sm text-gray-400">Despesas Realizadas</p><p className={`text-2xl font-bold ${summary.totalRealizadoDespesa > summary.totalMetaDespesa && summary.totalMetaDespesa > 0 ? 'text-red-500' : 'text-white'}`}>{formatCurrency(summary.totalRealizadoDespesa)}</p></CardContent></Card>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Meta vs. Realizado por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)"/>
              <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value)}/>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)'}} formatter={(value) => formatCurrency(value)}/>
              <Legend wrapperStyle={{ bottom: 20 }} />
              <Bar dataKey="Meta Receita" barSize={20} fill="#16a34a" />
              <Bar dataKey="Receita Realizada" barSize={20} fill="#34d399" />
              <Bar dataKey="Meta Despesa" barSize={20} fill="#c026d3" />
              <Bar dataKey="Despesa Realizada" barSize={20} fill="#f43f5e" />
            </ComposedChart>
          </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>


      <Card className="glass-effect">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Orçamento Detalhado por Categoria</CardTitle>
              <CardDescription>Ajuste as metas para o mês selecionado.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Exibir Colunas</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.meta}
                    onCheckedChange={(value) => setColumnVisibility(prev => ({ ...prev, meta: value }))}
                  >
                    Meta
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.realizado}
                    onCheckedChange={(value) => setColumnVisibility(prev => ({ ...prev, realizado: value }))}
                  >
                    Realizado
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.status}
                    onCheckedChange={(value) => setColumnVisibility(prev => ({ ...prev, status: value }))}
                  >
                    Status
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {isEditing ? (
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar
                </Button>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Ajustar Metas
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  {columnVisibility.meta && <TableHead className="text-right">Meta</TableHead>}
                  {columnVisibility.realizado && <TableHead className="text-right">Realizado</TableHead>}
                  {columnVisibility.status && <TableHead>Status</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {orcamentoData.map(item => (
                  <TableRow key={item.categoria_id}>
                    <TableCell className="font-medium">{item.categoria_nome}</TableCell>
                     {item.categoria_tipo === 'entrada' ? (
                       <>
                         {columnVisibility.meta && <TableCell className="text-right">
                           {isEditing ? (
                             <Input type="text" value={formatCurrency(item.meta_receita)} onChange={e => handleInputChange(item.categoria_id, 'meta_receita', e.target.value)} className="w-32 ml-auto text-right bg-slate-800" />
                           ) : (formatCurrency(item.meta_receita))}
                         </TableCell>}
                         {columnVisibility.realizado && <TableCell className="text-right text-emerald-400">{formatCurrency(item.realizado_receita)}</TableCell>}
                         {columnVisibility.status && <TableCell><StatusBadge realizado={item.realizado_receita} meta={item.meta_receita} tipo="receita" /></TableCell>}
                       </>
                     ) : (
                       <>
                         {columnVisibility.meta && <TableCell className="text-right">
                           {isEditing ? (
                             <Input type="text" value={formatCurrency(item.meta_despesa)} onChange={e => handleInputChange(item.categoria_id, 'meta_despesa', e.target.value)} className="w-32 ml-auto text-right bg-slate-800" />
                           ) : (formatCurrency(item.meta_despesa))}
                         </TableCell>}
                         {columnVisibility.realizado && <TableCell className="text-right text-red-500">{formatCurrency(item.realizado_despesa)}</TableCell>}
                         {columnVisibility.status && <TableCell><StatusBadge realizado={item.realizado_despesa} meta={item.meta_despesa} tipo="despesa" /></TableCell>}
                       </>
                     )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanejamentoOrcamentario;