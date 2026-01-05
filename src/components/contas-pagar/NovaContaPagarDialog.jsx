import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { useAppContext } from '@/contexts/AppContext';
import { Switch } from '@/components/ui/switch';

const NovaContaPagarDialog = ({ onConfirm }) => {
  const { fornecedores, categorias } = useAppContext();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    fornecedor_id: '',
    descricao: '',
    valor: 0,
    data_vencimento: new Date().toISOString().split('T')[0],
    categoria_id: '',
    is_recorrente: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      fornecedor_id: '',
      descricao: '',
      valor: 0,
      data_vencimento: new Date().toISOString().split('T')[0],
      categoria_id: '',
      is_recorrente: false,
    });
  }

  const handleOpenChange = (isOpen) => {
    if(!isOpen) {
      resetForm();
    }
    setOpen(isOpen);
  }

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (name, value) => {
    const finalValue = value === 'none' ? '' : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async () => {
    if (!formData.descricao || formData.valor <= 0) {
      toast({ title: "Campos obrigatórios", description: "Descrição e valor são obrigatórios.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onConfirm(formData);
      handleOpenChange(false);
    } catch (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const categoriasSaida = categorias.saidas.map(nome => {
      const catObj = categorias.raw?.find(c => c.nome === nome && c.tipo === 'saida');
      return { id: catObj?.id, nome };
  }).filter(c => c.id);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gradient-bg"><Plus className="w-4 h-4 mr-2" />Nova Conta a Pagar</Button>
      </DialogTrigger>
      <DialogContent className="glass-effect">
        <DialogHeader>
          <DialogTitle>Criar Nova Conta a Pagar</DialogTitle>
          <DialogDescription>
            Registre uma nova despesa ou conta.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fornecedor_id">Fornecedor</Label>
              <Select value={formData.fornecedor_id} onValueChange={(v) => handleSelectChange('fornecedor_id', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione um fornecedor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {fornecedores.map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="categoria_id">Categoria</Label>
              <Select value={formData.categoria_id} onValueChange={(v) => handleSelectChange('categoria_id', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {categoriasSaida.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Input id="descricao" value={formData.descricao} onChange={handleChange} placeholder="Ex: Aluguel do escritório"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="valor">Valor *</Label>
                <CurrencyInput
                  id="valor"
                  value={formData.valor}
                  onValueChange={(value) => setFormData(p => ({ ...p, valor: value }))}
                />
              </div>
              <div>
                <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
                <Input id="data_vencimento" type="date" value={formData.data_vencimento} onChange={handleChange} />
              </div>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
                id="is_recorrente"
                checked={formData.is_recorrente}
                onCheckedChange={(checked) => setFormData(p => ({ ...p, is_recorrente: checked }))}
            />
            <Label htmlFor="is_recorrente">É um pagamento recorrente?</Label>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Criar Conta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NovaContaPagarDialog;