import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/CurrencyInput';

const AtivarRecorrenciaDialog = ({ open, onOpenChange, cliente, onConfirm }) => {
  const [valorMensal, setValorMensal] = useState(0);
  const [numeroMeses, setNumeroMeses] = useState(12);
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (valorMensal <= 0 || numeroMeses <= 0) {
      toast({ title: "Valores inválidos", description: "O valor e o número de meses devem ser maiores que zero.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onConfirm({
        clienteId: cliente.id,
        valorMensal: valorMensal,
        numeroMeses: numeroMeses,
        dataInicio: dataInicio,
      });
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cliente) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect">
        <DialogHeader>
          <DialogTitle>Ativar Recorrência para {cliente.nome}</DialogTitle>
          <DialogDescription>
            Defina os detalhes da cobrança recorrente. Isso irá gerar as parcelas em Contas a Receber.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="valor-mensal">Valor Mensal</Label>
            <CurrencyInput
              id="valor-mensal"
              value={valorMensal}
              onValueChange={(value) => setValorMensal(value)}
              className="text-lg"
            />
          </div>
          <div>
            <Label htmlFor="numero-meses">Número de Meses</Label>
            <Input
              id="numero-meses"
              type="number"
              value={numeroMeses}
              onChange={(e) => setNumeroMeses(parseInt(e.target.value, 10))}
              min="1"
            />
          </div>
          <div>
            <Label htmlFor="data-inicio">Data da Primeira Cobrança</Label>
            <Input
              id="data-inicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Ativar e Gerar Parcelas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AtivarRecorrenciaDialog;