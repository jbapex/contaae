import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format, parseISO, addMonths, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const ProjecaoRecebimentosChart = ({ contas }) => {
  const processData = () => {
    if (!contas || contas.length === 0) return [];

    const today = new Date();
    const projection = {};

    // Initialize future months
    for (let i = 0; i < 6; i++) {
      const monthKey = format(addMonths(today, i), 'yyyy-MM');
      projection[monthKey] = 0;
    }

    let totalAtrasado = 0;

    contas.forEach(conta => {
      if (conta.status === 'pago') return;

      const vencimento = parseISO(conta.data_vencimento);
      if (isPast(vencimento) && conta.status === 'pendente') {
        totalAtrasado += Number(conta.valor_parcela);
      } else if (conta.status === 'pendente') {
        const monthKey = format(vencimento, 'yyyy-MM');
        if (projection.hasOwnProperty(monthKey)) {
          projection[monthKey] += Number(conta.valor_parcela);
        }
      }
    });

    const chartData = [];
    if (totalAtrasado > 0) {
      chartData.push({ name: 'Atrasado', valor: totalAtrasado, fill: '#ef4444' });
    }

    Object.keys(projection).forEach(key => {
      const date = parseISO(`${key}-01`);
      chartData.push({
        name: format(date, 'MMM/yy', { locale: ptBR }),
        valor: projection[key],
        fill: '#34d399'
      });
    });

    return chartData;
  };

  const data = processData();

  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle>Projeção de Recebimentos</CardTitle>
        <CardDescription>Valores pendentes e atrasados para os próximos meses.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value / 1000}k`} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: '#f1f5f9' }}
              formatter={(value) => [formatCurrency(value), 'Valor']}
            />
            <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProjecaoRecebimentosChart;