import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, VenetianMask } from 'lucide-react';

const MapeamentoColunasDialog = ({ open, setOpen, csvHeaders, csvData, onConfirm }) => {
  const [mapping, setMapping] = useState({ data: '', descricao: '', valor: '', entrada: '', saida: '' });
  const [valorType, setValorType] = useState('single'); // 'single' ou 'double'
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    if (!mapping.data || !mapping.descricao || (valorType === 'single' && !mapping.valor) || (valorType === 'double' && (!mapping.entrada || !mapping.saida))) {
      toast({ title: 'Campos Incompletos', description: 'Por favor, mapeie todos os campos obrigatórios.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const success = await onConfirm(mapping);
    setLoading(false);
    if (success) {
      setOpen(false);
      // Reset state for next time
      setMapping({ data: '', descricao: '', valor: '', entrada: '', saida: '' });
      setValorType('single');
    }
  };

  const previewData = csvData.slice(0, 3);

  const getMappedValue = (row, field) => {
    if (field === 'tipo') {
      if (valorType === 'single') {
        const valorRaw = row[mapping.valor] || '0';
        const valorNum = parseFloat(String(valorRaw).replace(/[^\d,-]/g, '').replace(',', '.'));
        return valorNum >= 0 ? 'Entrada' : 'Saída';
      }
      const entradaRaw = row[mapping.entrada] || '0';
      const valorEntrada = parseFloat(String(entradaRaw).replace(/[^\d,-]/g, '').replace(',', '.'));
      if (valorEntrada > 0) return 'Entrada';
      
      const saidaRaw = row[mapping.saida] || '0';
      const valorSaida = parseFloat(String(saidaRaw).replace(/[^\d,-]/g, '').replace(',', '.'));
      if (valorSaida > 0) return 'Saída';
      
      return '-';
    }
    if (field === 'valor') {
       if (valorType === 'single') {
        const valorRaw = row[mapping.valor] || '0';
        return String(valorRaw);
      }
      const entradaRaw = row[mapping.entrada] || '0';
      const valorEntrada = parseFloat(String(entradaRaw).replace(/[^\d,-]/g, '').replace(',', '.'));
      if (valorEntrada > 0) return `+${valorEntrada.toFixed(2)}`;
      
      const saidaRaw = row[mapping.saida] || '0';
      const valorSaida = parseFloat(String(saidaRaw).replace(/[^\d,-]/g, '').replace(',', '.'));
      if (valorSaida > 0) return `-${valorSaida.toFixed(2)}`;

      return '0.00';
    }
    return row[mapping[field]] || '-';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl glass-effect">
        <DialogHeader>
          <DialogTitle>Mapear Colunas do Extrato</DialogTitle>
          <DialogDescription>
            Associe as colunas do seu arquivo CSV aos campos do sistema para importar corretamente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Campos do Sistema</h3>
            <div>
              <Label>Formato do Valor</Label>
              <Select value={valorType} onValueChange={setValorType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Coluna Única (Ex: 100.00, -50.00)</SelectItem>
                  <SelectItem value="double">Colunas Separadas (Débito e Crédito)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Coluna de Data *</Label>
              <Select value={mapping.data} onValueChange={(v) => setMapping(p => ({ ...p, data: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione a coluna" /></SelectTrigger>
                <SelectContent>{csvHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Coluna de Descrição *</Label>
              <Select value={mapping.descricao} onValueChange={(v) => setMapping(p => ({ ...p, descricao: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione a coluna" /></SelectTrigger>
                <SelectContent>{csvHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {valorType === 'single' ? (
              <div>
                <Label>Coluna de Valor *</Label>
                <Select value={mapping.valor} onValueChange={(v) => setMapping(p => ({ ...p, valor: v, entrada: '', saida: '' }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione a coluna" /></SelectTrigger>
                  <SelectContent>{csvHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Coluna de Entradas (Crédito) *</Label>
                  <Select value={mapping.entrada} onValueChange={(v) => setMapping(p => ({ ...p, entrada: v, valor: '' }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>{csvHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Coluna de Saídas (Débito) *</Label>
                  <Select value={mapping.saida} onValueChange={(v) => setMapping(p => ({ ...p, saida: v, valor: '' }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>{csvHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Pré-visualização da Importação</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-700 max-h-60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{getMappedValue(row, 'data')}</TableCell>
                      <TableCell>{getMappedValue(row, 'descricao')}</TableCell>
                      <TableCell>{getMappedValue(row, 'tipo')}</TableCell>
                      <TableCell className="text-right">{getMappedValue(row, 'valor')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Confirmar e Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MapeamentoColunasDialog;