import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/contexts/AppContext';

const BaixarContaPagarDialog = ({ open, onOpenChange, conta, onConfirm }) => {
  const [valorPago, setValorPago] = useState(0);
  const [dataPagamento, setDataPagamento] = useState('');
  const [contaBancariaId, setContaBancariaId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { contasBancarias, settings } = useAppContext();

  useEffect(() => {
    if (conta) {
      setValorPago(conta.valor_parcela);
      setDataPagamento(new Date().toISOString().split('T')[0]);
      if (contasBancarias.length > 0) {
        setContaBancariaId(contasBancarias[0].id);
      }
    }
  }, [conta, contasBancarias]);

  if (!conta) return null;

  const handleSubmit = async () => {
    if (valorPago <= 0) {
      toast({ title: "Valor inválido", description: "O valor pago deve ser maior que zero.", variant: "destructive" });
      return;
    }
    if (settings?.contas_bancarias_ativo && !contaBancariaId) {
        toast({ title: "Campo obrigatório", description: "Por favor, selecione uma conta bancária.", variant: "destructive" });
        return;
    }
    
    setIsSubmitting(true);
    try {
      await onConfirm({
        contaId: conta.id,
        valorPago,
        dataPagamento,
        contaBancariaId,
      });
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect">
        <DialogHeader>
          <DialogTitle>Baixar Conta a Pagar</DialogTitle>
          <DialogDescription>
            Confirme o pagamento da conta para {conta.fornecedor_nome}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="valor-pago">Valor Pago</Label>
            <CurrencyInput
              id="valor-pago"
              value={valorPago}
              onValueChange={(value) => setValorPago(value)}
              className="text-lg"
            />
          </div>
          <div>
            <Label htmlFor="data-pagamento">Data do Pagamento</Label>
            <Input
              id="data-pagamento"
              type="date"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
            />
          </div>
          {settings?.contas_bancarias_ativo && (
            <div>
              <Label htmlFor="conta-bancaria">Conta Bancária de Saída</Label>
              <Select value={contaBancariaId} onValueChange={setContaBancariaId}>
                  <SelectTrigger><SelectValue placeholder="Selecione a conta" /></SelectTrigger>
                  <SelectContent>
                      {contasBancarias.map(cb => (
                          <SelectItem key={cb.id} value={cb.id}>{cb.nome_banco}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BaixarContaPagarDialog;