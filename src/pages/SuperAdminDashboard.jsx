import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, ListChecks, TrendingUp, AlertTriangle, UserPlus, Package, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import { dashboardService } from '@/lib/services/dashboardService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const StatCard = ({ title, value, icon: Icon, description }) => (
  <Card className="glass-effect border-white/20 hover-scale">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
      <Icon className="h-5 w-5 text-gray-400" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-white">{value}</div>
      <p className="text-xs text-gray-400">{description}</p>
    </CardContent>
  </Card>
);

const QuickAccessButton = ({ label, icon: Icon, path }) => {
  const navigate = useNavigate();
  return (
    <Button variant="outline" className="glass-effect" onClick={() => navigate(path)}>
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
};

const PIE_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboardData = await dashboardService.getDashboardData();
        setData(dashboardData);
      } catch (error) {
        toast({
          title: 'Erro ao carregar dashboard',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div></div>;
  }

  if (!data) {
    return <div className="text-center text-gray-400">Não foi possível carregar os dados do dashboard.</div>;
  }
  
  const { kpis, newUsersChart, planDistribution, recentActivities } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Dashboard Geral</h1>
        <p className="text-gray-400">Visão geral e indicadores chave da plataforma.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Acesso Rápido</h2>
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <QuickAccessButton label="Usuários" icon={Users} path="/super-admin/users-and-plans" />
          <QuickAccessButton label="Planos" icon={Package} path="/super-admin/plans" />
          <QuickAccessButton label="Faturamento" icon={BarChart2} path="/super-admin/billing" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Usuários Ativos" value={kpis.activeUsers} icon={Users} description="Nos últimos 30 dias" />
        <StatCard title="Receita do Mês" value={`R$ ${kpis.monthlyRevenue.toFixed(2)}`} icon={DollarSign} description="Faturamento no mês atual" />
        <StatCard title="Pendências" value={kpis.overdueInstallments} icon={AlertTriangle} description="Parcelas de crediário atrasadas" />
        <StatCard title="Total de Lançamentos" value={kpis.totalEntries} icon={ListChecks} description="Desde o início" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-effect border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center"><TrendingUp className="mr-2" />Novos Usuários por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={newUsersChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" allowDecimals={false} fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
                <Legend />
                <Line type="monotone" dataKey="Novos Usuários" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass-effect border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center"><Package className="mr-2" />Distribuição de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={planDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="overflow-x-auto">
             <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-800/20">
                  <TableHead className="text-white">Data/Hora</TableHead>
                  <TableHead className="text-white">Usuário</TableHead>
                  <TableHead className="text-white">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity, index) => (
                  <TableRow key={index} className="border-slate-800 hover:bg-slate-800/20">
                    <TableCell>{format(new Date(activity.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell className="font-medium">{activity.user_email}</TableCell>
                    <TableCell>
                      <Badge variant={activity.type === 'Novo Usuário' ? 'success' : 'secondary'}>{activity.action}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
           </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default SuperAdminDashboard;