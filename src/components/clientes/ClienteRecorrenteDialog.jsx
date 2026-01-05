import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { clienteService } from '@/lib/services/clienteService';

const ClienteRecorrenteDialog = ({ open, onOpenChange, cliente, onConfirm }) => {
  const [valorMensal, setValorMensal] = useState(0);
  const [meses, setMeses] = useState(12);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (valorMensal <= 0 || meses <= 0) {
      toast({ title: "Valores inválidos", description: "O valor mensal e a quantidade de meses devem ser maiores que zero.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await clienteService.setupRecorrencia(cliente.id, valorMensal, meses);
      toast({
        title: "Sucesso!",
        description: `Recorrência configurada para ${cliente.nome}.`,
        className: "bg-emerald-500 text-white"
      });
      onConfirm();
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
          <DialogTitle>Configurar Recorrência</DialogTitle>
          <DialogDescription>
            Defina o valor mensal e por quantos meses a cobrança para <span className="font-bold text-cyan-400">{cliente.nome}</span> será gerada.
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
            <Label htmlFor="meses">Gerar por quantos meses?</Label>
            <Input
              id="meses"
              type="number"
              value={meses}
              onChange={(e) => setMeses(parseInt(e.target.value, 10))}
              min="1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Confirmar e Gerar Parcelas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteRecorrenteDialog;