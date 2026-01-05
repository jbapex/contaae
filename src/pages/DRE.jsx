import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { lancamentoService } from '@/lib/services/lancamentoService';
import { calculations } from '@/lib/utils/calculations';
import { helpers } from '@/lib/dre-utils';
import { useToast } from '@/components/ui/use-toast';
import DREMensal from '@/components/dre/DREMensal';
import DREAnual from '@/components/dre/DREAnual';

function DRE() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  const [monthlyDRE, setMonthlyDRE] = useState(null);
  const [yearlyDRE, setYearlyDRE] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadDREData = useCallback(async () => {
    setLoading(true);
    const yearInt = parseInt(selectedYear, 10);
    const monthIndex = parseInt(selectedMonth, 10);
    const allLancamentos = await lancamentoService.getLancamentos();
    
    setMonthlyDRE(calculations.getMonthlyResults(allLancamentos, monthIndex, yearInt));
    setYearlyDRE(calculations.getYearlyResults(allLancamentos, yearInt));
    setLoading(false);
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    loadDREData();
  }, [loadDREData]);

  const handleExportDRE = () => {
    toast({
      title: "🚧 Funcionalidade em desenvolvimento",
      description: "A exportação do DRE será implementada em breve! 🚀"
    });
  };

  const availableYears = [2022, 2023, 2024, 2025];
  const availableMonths = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: helpers.getMonthName(i)
  }));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient">DRE - Demonstração do Resultado</h1>
          <p className="text-gray-400">Análise detalhada da performance financeira</p>
        </div>
        <Button onClick={handleExportDRE} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar DRE
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Ano</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Mês (para DRE Mensal)</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {availableMonths.map(month => (
                      <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <Tabs defaultValue="mensal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 glass-effect">
              <TabsTrigger value="mensal">DRE Mensal</TabsTrigger>
              <TabsTrigger value="anual">DRE Anual</TabsTrigger>
            </TabsList>

            <TabsContent value="mensal">
              <DREMensal 
                monthlyDRE={monthlyDRE} 
                selectedYear={selectedYear} 
                selectedMonth={selectedMonth} 
                formatCurrency={helpers.formatCurrency} 
                getMonthName={helpers.getMonthName} 
              />
            </TabsContent>
            
            <TabsContent value="anual">
              <DREAnual
                yearlyDRE={yearlyDRE}
                selectedYear={selectedYear}
                formatCurrency={helpers.formatCurrency}
                getMonthName={helpers.getMonthName}
              />
            </TabsContent>
          </Tabs>
        )}
      </motion.div>
    </div>
  );
}

export default DRE;