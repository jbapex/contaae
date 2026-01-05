import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, TrendingUp, Calculator, Calendar, ChevronDown, ChevronRight } from 'lucide-react';

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
};


const DREMensal = ({ monthlyDRE, selectedYear, selectedMonth, formatCurrency, getMonthName }) => {
  if (!monthlyDRE) return null;

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            <span>DRE - {getMonthName(parseInt(selectedMonth, 10))} {selectedYear}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8 text-emerald-500" />
                  <div>
                    <p className="text-sm text-gray-400">Receitas Totais</p>
                    <p className="text-xl font-bold text-emerald-500">{formatCurrency(monthlyDRE.entradas)}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center space-x-3">
                  <Calculator className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-400">Despesas Totais</p>
                    <p className="text-xl font-bold text-red-500">{formatCurrency(monthlyDRE.saidas)}</p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${monthlyDRE.lucro >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                <div className="flex items-center space-x-3">
                  <Calendar className={`w-8 h-8 ${monthlyDRE.lucro >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                  <div>
                    <p className="text-sm text-gray-400">Resultado Líquido</p>
                    <p className={`text-xl font-bold ${monthlyDRE.lucro >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrency(monthlyDRE.lucro)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Demonstração do Resultado do Exercício</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="font-semibold text-emerald-400">RECEITA OPERACIONAL BRUTA</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(monthlyDRE.entradas)}</span>
                </div>
                <CategoryBreakdown 
                  title="Detalhes da Receita"
                  data={monthlyDRE.entradasPorCategoria}
                  formatCurrency={formatCurrency}
                  colorClass="text-emerald-400"
                />

                <div className="flex justify-between items-center py-2 border-b border-white/10 mt-4">
                  <span className="font-semibold text-red-400">(-) DESPESAS OPERACIONAIS</span>
                  <span className="font-bold text-red-400">({formatCurrency(monthlyDRE.saidas)})</span>
                </div>
                <CategoryBreakdown 
                  title="Detalhes das Despesas"
                  data={monthlyDRE.saidasPorCategoria}
                  formatCurrency={formatCurrency}
                  colorClass="text-red-400"
                />

                <div className="flex justify-between items-center py-3 border-t-2 border-white/20 mt-4">
                  <span className="font-bold text-lg">RESULTADO LÍQUIDO DO PERÍODO</span>
                  <span className={`font-bold text-lg ${monthlyDRE.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(monthlyDRE.lucro)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Margem Líquida</span>
                  <span className={`font-semibold ${monthlyDRE.margem >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{monthlyDRE.margem.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Total de Lançamentos</span>
                  <span className="font-semibold text-blue-400">{monthlyDRE.lancamentos.length}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DREMensal;