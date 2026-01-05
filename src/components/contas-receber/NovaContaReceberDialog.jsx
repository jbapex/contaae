import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { useToast } from '@/components/ui/use-toast';
    import { Loader2, Plus } from 'lucide-react';
    import { CurrencyInput } from '@/components/ui/CurrencyInput';
    import { useAppContext } from '@/contexts/AppContext';

    const NovaContaReceberDialog = ({ onConfirm }) => {
      const { clientes, categorias } = useAppContext();
      const [open, setOpen] = useState(false);
      const [formData, setFormData] = useState({
        cliente_id: '',
        descricao: '',
        valor: 0,
        numero_parcelas: 1,
        data: new Date().toISOString().split('T')[0],
        categoria_id: '',
      });
      const [isSubmitting, setIsSubmitting] = useState(false);
      const { toast } = useToast();

      const resetForm = () => {
        setFormData({
          cliente_id: '',
          descricao: '',
          valor: 0,
          numero_parcelas: 1,
          data: new Date().toISOString().split('T')[0],
          categoria_id: '',
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
        if (!formData.cliente_id || !formData.descricao || formData.valor <= 0) {
          toast({ title: "Campos obrigatórios", description: "Cliente, descrição e valor são obrigatórios.", variant: "destructive" });
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
      
      const categoriasEntrada = categorias.entradas.map(nome => {
          const catObj = categorias.raw?.find(c => c.nome === nome && c.tipo === 'entrada');
          return { id: catObj?.id, nome };
      }).filter(c => c.id);

      return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gradient-bg"><Plus className="w-4 h-4 mr-2" />Nova Conta a Receber</Button>
          </DialogTrigger>
          <DialogContent className="glass-effect">
            <DialogHeader>
              <DialogTitle>Criar Nova Conta a Receber</DialogTitle>
              <DialogDescription>
                Registre uma nova venda parcelada ou cobrança única.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente_id">Cliente *</Label>
                  <Select value={formData.cliente_id} onValueChange={(v) => handleSelectChange('cliente_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                    <SelectContent>
                      {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="categoria_id">Categoria</Label>
                  <Select value={formData.categoria_id} onValueChange={(v) => handleSelectChange('categoria_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {categoriasEntrada.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Input id="descricao" value={formData.descricao} onChange={handleChange} placeholder="Ex: Venda de serviço X"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="valor">Valor Total *</Label>
                    <CurrencyInput
                      id="valor"
                      value={formData.valor}
                      onValueChange={(value) => setFormData(p => ({ ...p, valor: value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data">Data da 1ª Parcela *</Label>
                    <Input id="data" type="date" value={formData.data} onChange={handleChange} />
                  </div>
              </div>

              <div>
                <Label htmlFor="numero_parcelas">Número de Parcelas *</Label>
                <Input id="numero_parcelas" type="number" min="1" value={formData.numero_parcelas} onChange={handleChange} />
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

    export default NovaContaReceberDialog;