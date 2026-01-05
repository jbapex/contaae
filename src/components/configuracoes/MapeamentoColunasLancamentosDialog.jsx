import React, { useState } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { useToast } from '@/components/ui/use-toast';
    import { Loader2 } from 'lucide-react';
    import { format } from 'date-fns';

    const MapeamentoColunasLancamentosDialog = ({ open, setOpen, csvHeaders, csvData, onConfirm }) => {
      const [mapping, setMapping] = useState({ data: '', descricao: '', valor: '', tipo: '', categoria: '', cliente: '' });
      const [loading, setLoading] = useState(false);
      const { toast } = useToast();

      const handleConfirm = async () => {
        if (!mapping.data || !mapping.descricao || !mapping.valor || !mapping.tipo) {
          toast({ title: 'Campos Obrigatórios', description: 'Por favor, mapeie os campos de data, descrição, valor e tipo.', variant: 'destructive' });
          return;
        }
        setLoading(true);
        const success = await onConfirm(mapping);
        setLoading(false);
        if (success) {
          setOpen(false);
          // Reset state for next time
          setMapping({ data: '', descricao: '', valor: '', tipo: '', categoria: '', cliente: '' });
        }
      };

      const previewData = csvData.slice(0, 3);
      
      const parseDate = (dateString) => {
        if (!dateString) return '-';
        let parsedDate;
        if (/\d{4}-\d{2}-\d{2}/.test(dateString)) { // YYYY-MM-DD
            parsedDate = new Date(dateString + 'T00:00:00');
        } else if (/\d{2}\/\d{2}\/\d{4}/.test(dateString)) { // DD/MM/YYYY
            const [dia, mes, ano] = dateString.split('/');
            parsedDate = new Date(`${ano}-${mes}-${dia}T00:00:00`);
        } else {
            parsedDate = new Date(dateString);
        }
        return isNaN(parsedDate.getTime()) ? 'Data Inválida' : format(parsedDate, 'dd/MM/yyyy');
      };

      const getMappedValue = (row, field) => {
        const mappedField = mapping[field];
        if (!mappedField || !row[mappedField]) return '-';
        
        if (field === 'data') {
            return parseDate(row[mappedField]);
        }
        
        if (field === 'tipo') {
            const tipoValue = String(row[mappedField]).toLowerCase().trim();
            if (tipoValue === 'entrada' || tipoValue === 'saida') {
                return tipoValue.charAt(0).toUpperCase() + tipoValue.slice(1);
            }
            return 'Tipo Inválido';
        }
        
        if (field === 'valor') {
            const valorRaw = row[mappedField] || '0';
            const valorNum = parseFloat(String(valorRaw).replace(/[^\d,-]/g, '').replace(',', '.'));
            return isNaN(valorNum) ? 'Valor Inválido' : valorNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
        
        return row[mappedField];
      };

      const validCsvHeaders = csvHeaders.filter(h => h && h.trim() !== '');

      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl glass-effect">
            <DialogHeader>
              <DialogTitle>Mapear Colunas para Importação</DialogTitle>
              <DialogDescription>
                Associe as colunas do seu arquivo CSV aos campos do sistema para importar os lançamentos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Campos Obrigatórios *</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Coluna de Data *</Label>
                        <Select value={mapping.data} onValueChange={(v) => setMapping(p => ({ ...p, data: v }))}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>{validCsvHeaders.map(h => <SelectItem key={`data-${h}`} value={h}>{h}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Coluna de Descrição *</Label>
                        <Select value={mapping.descricao} onValueChange={(v) => setMapping(p => ({ ...p, descricao: v }))}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>{validCsvHeaders.map(h => <SelectItem key={`desc-${h}`} value={h}>{h}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Coluna de Valor *</Label>
                        <Select value={mapping.valor} onValueChange={(v) => setMapping(p => ({ ...p, valor: v }))}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>{validCsvHeaders.map(h => <SelectItem key={`valor-${h}`} value={h}>{h}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Coluna de Tipo *</Label>
                        <Select value={mapping.tipo} onValueChange={(v) => setMapping(p => ({ ...p, tipo: v }))}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>{validCsvHeaders.map(h => <SelectItem key={`tipo-${h}`} value={h}>{h}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
                 <h3 className="font-semibold text-lg pt-4">Campos Opcionais</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Coluna de Categoria</Label>
                        <Select value={mapping.categoria} onValueChange={(v) => setMapping(p => ({ ...p, categoria: v }))}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>{validCsvHeaders.map(h => <SelectItem key={`cat-${h}`} value={h}>{h}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Coluna de Cliente</Label>
                        <Select value={mapping.cliente} onValueChange={(v) => setMapping(p => ({ ...p, cliente: v }))}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>{validCsvHeaders.map(h => <SelectItem key={`cli-${h}`} value={h}>{h}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
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
                        <TableHead>Categoria</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{getMappedValue(row, 'data')}</TableCell>
                          <TableCell>{getMappedValue(row, 'descricao')}</TableCell>
                          <TableCell>{getMappedValue(row, 'tipo')}</TableCell>
                          <TableCell>{getMappedValue(row, 'categoria')}</TableCell>
                          <TableCell>{getMappedValue(row, 'cliente')}</TableCell>
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
              <Button onClick={handleConfirm} disabled={loading} className="gradient-bg">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Confirmar e Importar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default MapeamentoColunasLancamentosDialog;