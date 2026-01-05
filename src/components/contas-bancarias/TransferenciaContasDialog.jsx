import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowRightLeft } from 'lucide-react';
import { format } from 'date-fns';

const TransferenciaContasDialog = ({ open, setOpen, onConfirm, contas }) => {
  const [contaOrigemId, setContaOrigemId] = useState('');
  const [contaDestinoId, setContaDestinoId] = useState('');
  const [valor, setValor] = useState(0);
  const [data, setData] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setContaOrigemId('');
    setContaDestinoId('');
    setValor(0);
    setData(new Date());
  };

  const handleSubmit = async () => {
    if (!contaOrigemId || !contaDestinoId || valor <= 0) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos para realizar a transferência.", variant: "destructive" });
      return;
    }
    if (contaOrigemId === contaDestinoId) {
      toast({ title: "Seleção inválida", description: "A conta de origem e destino não podem ser a mesma.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const success = await onConfirm({
      contaOrigemId,
      contaDestinoId,
      valor,
      data: format(data, 'yyyy-MM-dd'),
    });
    if (success) {
      setOpen(false);
    }
    setIsSubmitting(false);
  };

  const contasDestinoFiltradas = contas.filter(c => c.id !== contaOrigemId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect">
        <DialogHeader>
          <DialogTitle>Transferência Entre Contas</DialogTitle>
          <DialogDescription>
            Movimente valores entre suas contas bancárias.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <Label htmlFor="conta-origem">Conta de Origem *</Label>
              <Select value={contaOrigemId} onValueChange={setContaOrigemId}>
                <SelectTrigger id="conta-origem"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {contas.map(conta => (
                    <SelectItem key={conta.id} value={conta.id}>{conta.nome_banco}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="conta-destino">Conta de Destino *</Label>
              <Select value={contaDestinoId} onValueChange={setContaDestinoId} disabled={!contaOrigemId}>
                <SelectTrigger id="conta-destino"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {contasDestinoFiltradas.map(conta => (
                    <SelectItem key={conta.id} value={conta.id}>{conta.nome_banco}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor">Valor da Transferência *</Label>
              <CurrencyInput id="valor" value={valor} onValueChange={setValor} />
            </div>
            <div>
              <Label htmlFor="data-transferencia">Data da Transferência *</Label>
              <DatePicker date={data} setDate={setData} id="data-transferencia" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="mr-2 h-4 w-4" />}
            Confirmar Transferência
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferenciaContasDialog;