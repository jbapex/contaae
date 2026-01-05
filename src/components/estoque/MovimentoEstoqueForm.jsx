import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const MovimentoEstoqueForm = ({ produto, onSave, setOpen }) => {
  const [formData, setFormData] = useState({
    produto_id: produto.id,
    tipo: 'entrada',
    quantidade: '',
    observacao: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
    setOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-medium">Produto: <span className="font-normal text-cyan-400">{produto.nome}</span></p>
        <p className="text-sm font-medium">Estoque Atual: <span className="font-normal text-cyan-400">{produto.quantidade_estoque} {produto.unidade_medida}</span></p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipo">Tipo de Movimento *</Label>
          <Select name="tipo" value={formData.tipo} onValueChange={(value) => handleSelectChange('tipo', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="saida">Saída</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="quantidade">Quantidade *</Label>
          <Input id="quantidade" name="quantidade" type="number" step="0.01" value={formData.quantidade} onChange={handleChange} required />
        </div>
      </div>
      <div>
        <Label htmlFor="observacao">Observação</Label>
        <Textarea id="observacao" name="observacao" value={formData.observacao} onChange={handleChange} placeholder="Ex: Compra do fornecedor X, Venda para cliente Y" />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Registrar Movimento
        </Button>
      </div>
    </form>
  );
};

export default MovimentoEstoqueForm;