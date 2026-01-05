import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calculator, Calendar, FileText, ChevronDown, ChevronRight } from 'lucide-react';

const CategoryBreakdown = ({ title, data, formatCurrency, colorClass }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (Object.keys(data).length === 0) return null;

  return (
    <div className="py-2">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
        <h4 className="font-semibold">{title}</h4>
        <div className="flex items-center">
          <span className={`font-bold mr-4 ${colorClass}`}>{formatCurrency(Object.values(data).reduce((s, v) => s + v, 0))}</span>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>
      {isOpen && (
        <ul className="mt-2 pl-4 border-l border-white/20">
          {Object.entries(data)
            .sort(([, a], [, b]) => b - a)
            .map(([categoria, valor]) => (
            <li key={categoria} className="flex justify-between items-center py-1 text-sm text-gray-300">
              <span>{categoria}</span>
              <span className={colorClass}>{formatCurrency(valor)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const DREAnual = ({ yearlyDRE, selectedYear, formatCurrency, getMonthName }) => {
  const totalAnualEntradas = yearlyDRE.reduce((sum, month) => sum + month.entradas, 0);
  const totalAnualSaidas = yearlyDRE.reduce((sum, month) => sum + month.saidas, 0);
  const totalAnualLucro = totalAnualEntradas - totalAnualSaidas;
  const margemAnual = totalAnualEntradas > 0 ? (totalAnualLucro / totalAnualEntradas) * 100 : 0;

  const chartData = yearlyDRE.map((data, index) => ({
    mes: getMonthName(index).substring(0, 3),
    receitas: data.entradas,
    despesas: data.saidas,
    lucro: data.lucro
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Receitas {selectedYear}</p>
                <p className="text-2xl font-bold text-emerald-500">{formatCurrency(totalAnualEntradas)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Despesas {selectedYear}</p>
                <p className="text-2xl font-bold text-red-500">{formatCurrency(totalAnualSaidas)}</p>
              </div>
              <Calculator className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Lucro {selectedYear}</p>
                <p className={`text-2xl font-bold ${totalAnualLucro >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {formatCurrency(totalAnualLucro)}
                </p>
              </div>
              <Calendar className={`w-8 h-8 ${totalAnualLucro >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Margem Anual</p>
                <p className={`text-2xl font-bold ${margemAnual >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {margemAnual.toFixed(1)}%
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Performance Mensal - {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="mes" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [formatCurrency(value), '']}
                />
                <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                <Bar dataKey="lucro" fill="#3b82f6" name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Resumo Mensal - {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4">Mês</th>
                  <th className="text-right py-3 px-4">Receitas</th>
                  <th className="text-right py-3 px-4">Despesas</th>
                  <th className="text-right py-3 px-4">Resultado</th>
                  <th className="text-right py-3 px-4">Margem %</th>
                </tr>
              </thead>
              <tbody>
                {yearlyDRE.map((data, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 font-medium">{getMonthName(index)}</td>
                    <td className="py-3 px-4 text-right text-emerald-500">{formatCurrency(data.entradas)}</td>
                    <td className="py-3 px-4 text-right text-red-500">{formatCurrency(data.saidas)}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${data.lucro >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrency(data.lucro)}</td>
                    <td className={`py-3 px-4 text-right ${data.margem >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{data.margem.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-white/20 font-bold">
                  <td className="py-3 px-4">TOTAL ANUAL</td>
                  <td className="py-3 px-4 text-right text-emerald-500">{formatCurrency(totalAnualEntradas)}</td>
                  <td className="py-3 px-4 text-right text-red-500">{formatCurrency(totalAnualSaidas)}</td>
                  <td className={`py-3 px-4 text-right ${totalAnualLucro >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrency(totalAnualLucro)}</td>
                  <td className={`py-3 px-4 text-right ${margemAnual >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{margemAnual.toFixed(1)}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DREAnual;