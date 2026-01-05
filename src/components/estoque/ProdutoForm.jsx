import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

const ProdutoForm = ({ produto, onSave, setOpen }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco_venda: '',
    preco_custo: '',
    unidade_medida: '',
    tipo: 'produto',
    ativo: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (produto) {
      setFormData({
        ...produto,
        preco_venda: produto.preco_venda || '',
        preco_custo: produto.preco_custo || '',
        descricao: produto.descricao || '',
        unidade_medida: produto.unidade_medida || '',
      });
    } else {
      setFormData({
        nome: '',
        descricao: '',
        preco_venda: '',
        preco_custo: '',
        unidade_medida: '',
        tipo: 'produto',
        ativo: true,
      });
    }
  }, [produto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome do Item *</Label>
          <Input id="nome" name="nome" value={formData.nome} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="tipo">Tipo *</Label>
          <Select name="tipo" value={formData.tipo} onValueChange={(value) => handleSelectChange('tipo', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="produto">Produto</SelectItem>
              <SelectItem value="servico">Serviço</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="preco_venda">Preço de Venda</Label>
          <Input id="preco_venda" name="preco_venda" type="number" step="0.01" value={formData.preco_venda} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="preco_custo">Preço de Custo</Label>
          <Input id="preco_custo" name="preco_custo" type="number" step="0.01" value={formData.preco_custo} onChange={handleChange} />
        </div>
      </div>
      {formData.tipo === 'produto' && (
        <div>
          <Label htmlFor="unidade_medida">Unidade de Medida</Label>
          <Input id="unidade_medida" name="unidade_medida" value={formData.unidade_medida} onChange={handleChange} placeholder="Ex: un, kg, L, m²" />
        </div>
      )}
      <div className="flex items-center space-x-2">
        <Switch id="ativo" name="ativo" checked={formData.ativo} onCheckedChange={(checked) => handleSwitchChange('ativo', checked)} />
        <Label htmlFor="ativo">Ativo</Label>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </div>
    </form>
  );
};

export default ProdutoForm;