import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/CurrencyInput';

const ContaBancariaForm = ({ open, setOpen, conta, onSave }) => {
  const [formData, setFormData] = useState({
    nome_banco: '',
    agencia: '',
    numero_conta: '',
    tipo: 'corrente',
    saldo_inicial: 0,
    status: 'ativa',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (conta) {
      setFormData({
        id: conta.id,
        nome_banco: conta.nome_banco || '',
        agencia: conta.agencia || '',
        numero_conta: conta.numero_conta || '',
        tipo: conta.tipo || 'corrente',
        saldo_inicial: conta.saldo_inicial || 0,
        status: conta.status || 'ativa',
      });
    } else {
      resetForm();
    }
  }, [conta, open]);

  const resetForm = () => {
    setFormData({
      nome_banco: '',
      agencia: '',
      numero_conta: '',
      tipo: 'corrente',
      saldo_inicial: 0,
      status: 'ativa',
    });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.nome_banco || !formData.tipo) {
      toast({ title: "Campos obrigatórios", description: "Nome do banco e tipo são obrigatórios.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    const success = await onSave(formData);
    if(success) {
        setOpen(false);
        resetForm();
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect w-11/12 max-w-lg rounded-lg">
        <DialogHeader>
          <DialogTitle>{conta ? 'Editar Conta Bancária' : 'Adicionar Nova Conta Bancária'}</DialogTitle>
          <DialogDescription>
            Preencha as informações da sua conta.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nome_banco">Nome do Banco/Instituição *</Label>
              <Input id="nome_banco" value={formData.nome_banco} onChange={handleChange} placeholder="Ex: Banco do Brasil, Nubank, Carteira"/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="agencia">Agência</Label>
                    <Input id="agencia" value={formData.agencia} onChange={handleChange} placeholder="0001"/>
                </div>
                <div>
                    <Label htmlFor="numero_conta">Número da Conta</Label>
                    <Input id="numero_conta" value={formData.numero_conta} onChange={handleChange} placeholder="12345-6"/>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select value={formData.tipo} onValueChange={(v) => handleSelectChange('tipo', v)}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="corrente">Conta Corrente</SelectItem>
                            <SelectItem value="poupanca">Poupança</SelectItem>
                            <SelectItem value="carteira">Carteira</SelectItem>
                            <SelectItem value="outra">Outra</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ativa">Ativa</SelectItem>
                            <SelectItem value="inativa">Inativa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label htmlFor="saldo_inicial">Saldo Inicial/Atual</Label>
                <CurrencyInput
                  id="saldo_inicial"
                  value={formData.saldo_inicial}
                  onValueChange={(value) => setFormData(p => ({ ...p, saldo_inicial: value }))}
                />
                 <p className="text-xs text-gray-400 mt-1">Informe o saldo atual da conta. O sistema usará este valor como ponto de partida.</p>
              </div>
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting} className="w-full sm:w-auto">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {conta ? 'Salvar Alterações' : 'Criar Conta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContaBancariaForm;