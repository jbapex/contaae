import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { clienteService } from '@/lib/services/clienteService';

const NovoClienteDialog = ({ open, onOpenChange, onConfirm, cliente }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    documento: '',
    descricao: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        documento: cliente.documento || '',
        descricao: cliente.descricao || '',
      });
    } else {
      resetForm();
    }
  }, [cliente, open]);

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      documento: '',
      descricao: '',
    });
  };

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      toast({ title: "Nome inválido", description: "O nome do cliente é obrigatório.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (cliente) {
        await clienteService.updateCliente(cliente.id, formData);
        toast({
          title: "Sucesso!",
          description: "Cliente atualizado com sucesso.",
          className: "bg-emerald-500 text-white"
        });
      } else {
        await clienteService.createCliente(formData);
        toast({
          title: "Sucesso!",
          description: "Cliente criado com sucesso.",
          className: "bg-emerald-500 text-white"
        });
      }
      onConfirm();
      handleOpenChange(false);
    } catch (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="glass-effect w-11/12 max-w-lg rounded-lg">
        <DialogHeader>
          <DialogTitle>{cliente ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Cliente *</Label>
              <Input id="nome" placeholder="Digite o nome" value={formData.nome} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="contato@cliente.com" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" placeholder="Ex: 5511999999999" value={formData.telefone} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="documento">CPF/CNPJ</Label>
              <Input id="documento" placeholder="00.000.000/0000-00" value={formData.documento} onChange={handleChange} />
            </div>
          </div>
          <div>
            <Label htmlFor="descricao">Descrição / Observações</Label>
            <Textarea id="descricao" placeholder="Detalhes sobre o cliente..." value={formData.descricao} onChange={handleChange} />
          </div>
          
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting} className="w-full sm:w-auto">Cancelar</Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {cliente ? 'Salvar Alterações' : 'Salvar Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovoClienteDialog;