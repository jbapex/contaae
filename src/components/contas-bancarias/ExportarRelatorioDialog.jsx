import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, FileDown } from 'lucide-react';
import { contaBancariaService } from '@/lib/services/contaBancariaService';
import { lancamentoService } from '@/lib/services/lancamentoService';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

const ExportarRelatorioDialog = ({ open, setOpen }) => {
  const [contas, setContas] = useState([]);
  const [selectedConta, setSelectedConta] = useState('');
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [loadingContas, setLoadingContas] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const fetchContas = async () => {
        setLoadingContas(true);
        try {
          const data = await contaBancariaService.getContasBancarias();
          setContas(data);
        } catch (error) {
          toast({ title: "Erro", description: "Não foi possível carregar as contas.", variant: "destructive" });
        } finally {
          setLoadingContas(false);
        }
      };
      fetchContas();
    }
  }, [open, toast]);

  const handleExport = async () => {
    if (!selectedConta) {
      toast({ title: "Campo obrigatório", description: "Por favor, selecione uma conta bancária.", variant: "destructive" });
      return;
    }
    setIsExporting(true);
    try {
      const lancamentos = await lancamentoService.getLancamentosPorConta(
        selectedConta,
        dataInicio ? format(dataInicio, 'yyyy-MM-dd') : null,
        dataFim ? format(dataFim, 'yyyy-MM-dd') : null
      );

      if (lancamentos.length === 0) {
        toast({ title: "Nenhum dado", description: "Não há lançamentos para os filtros selecionados.", variant: "default" });
        return;
      }

      const dataToExport = lancamentos.map(l => ({
        Data: format(new Date(l.data), 'dd/MM/yyyy'),
        Descrição: l.descricao,
        Categoria: l.categoria,
        Tipo: l.tipo === 'entrada' ? 'Entrada' : 'Saída',
        Valor: l.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      }));

      const csv = Papa.unparse(dataToExport);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const contaNome = contas.find(c => c.id === selectedConta)?.nome_banco || 'relatorio';
      saveAs(blob, `relatorio_${contaNome.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.csv`);

      toast({ title: "Sucesso!", description: "Relatório exportado com sucesso." });
      setOpen(false);

    } catch (error) {
      toast({ title: "Erro na exportação", description: "Não foi possível gerar o relatório.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect">
        <DialogHeader>
          <DialogTitle>Exportar Relatório de Lançamentos</DialogTitle>
          <DialogDescription>
            Selecione a conta e o período para exportar as entradas e saídas.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="conta-bancaria">Conta Bancária *</Label>
            <Select value={selectedConta} onValueChange={setSelectedConta} disabled={loadingContas}>
              <SelectTrigger id="conta-bancaria">
                <SelectValue placeholder={loadingContas ? "Carregando..." : "Selecione uma conta"} />
              </SelectTrigger>
              <SelectContent>
                {contas.map(conta => (
                  <SelectItem key={conta.id} value={conta.id}>{conta.nome_banco}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data-inicio">Data de Início</Label>
              <DatePicker date={dataInicio} setDate={setDataInicio} id="data-inicio" />
            </div>
            <div>
              <Label htmlFor="data-fim">Data de Fim</Label>
              <DatePicker date={dataFim} setDate={setDataFim} id="data-fim" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isExporting}>Cancelar</Button>
          <Button onClick={handleExport} disabled={isExporting || loadingContas}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
            Exportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportarRelatorioDialog;