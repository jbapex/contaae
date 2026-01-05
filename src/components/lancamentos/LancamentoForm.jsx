import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { AnimatePresence, motion } from 'framer-motion';

const LancamentoForm = ({ onSubmit, initialData, onCancel }) => {
  const { settings, clientes, categorias, contasBancarias, produtos } = useAppContext();
  const [formData, setFormData] = useState({
    tipo: 'entrada',
    valor: '',
    descricao: '',
    data: '',
    categoria: '',
    cliente: '',
    numero_parcelas: 1,
    conta_bancaria_id: '',
    produto_id: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData({
        tipo: initialData.tipo || 'entrada',
        valor: parseFloat(initialData.valor) || '',
        descricao: initialData.descricao || '',
        data: initialData.data ? new Date(initialData.data).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        categoria: initialData.categoria || '',
        cliente: initialData.cliente?.nome || '',
        conta_bancaria_id: initialData.conta_bancaria_id || '',
        produto_id: initialData.produto_id || '',
        numero_parcelas: 1,
      });
    } else {
      setFormData({
        tipo: 'entrada',
        valor: '',
        descricao: '',
        data: new Date().toISOString().split('T')[0],
        categoria: '',
        cliente: '',
        conta_bancaria_id: '',
        produto_id: '',
        numero_parcelas: 1,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (name, value) => {
    const isNone = value === 'none' || value === '';
    setFormData(prev => ({ ...prev, [name]: isNone ? '' : value, ...(name === 'tipo' && { categoria: '' }) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.tipo || !formData.valor || !formData.descricao || !formData.data) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    if (formData.tipo === 'crediario' && (!formData.cliente || formData.cliente === 'none')) {
      toast({
        title: "Erro",
        description: "Selecione um cliente para vendas em crediário.",
        variant: "destructive"
      });
      return;
    }
    onSubmit(formData);
  };

  const isCrediario = formData.tipo === 'crediario';
  const isEntrada = formData.tipo === 'entrada';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipo">Tipo *</Label>
          <Select value={formData.tipo} onValueChange={(value) => handleSelectChange('tipo', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="saida">Saída</SelectItem>
              {settings?.crediario_ativo && <SelectItem value="crediario">Crediário</SelectItem>}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="valor">{isCrediario ? 'Valor Total *' : 'Valor *'}</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={formData.valor}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="descricao">Descrição *</Label>
        <Input
          id="descricao"
          placeholder="Descrição do lançamento"
          value={formData.descricao}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="data">{isCrediario ? 'Data da 1ª Parcela *' : 'Data *'}</Label>
          <Input
            id="data"
            type="date"
            value={formData.data}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Select value={formData.categoria} onValueChange={(value) => handleSelectChange('categoria', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              {formData.tipo && categorias[formData.tipo === 'saida' ? 'saidas' : 'entradas'].map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {settings?.contas_bancarias_ativo && !isCrediario && (
        <div>
          <Label htmlFor="conta_bancaria_id">Conta Bancária</Label>
          <Select value={formData.conta_bancaria_id} onValueChange={(value) => handleSelectChange('conta_bancaria_id', value)}>
            <SelectTrigger><SelectValue placeholder="Selecione uma conta" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              {contasBancarias.map(conta => (
                <SelectItem key={conta.id} value={conta.id}>{conta.nome_banco} - {conta.numero_conta}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <AnimatePresence>
        {isCrediario && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <Label htmlFor="cliente">Cliente *</Label>
                <Select value={formData.cliente} onValueChange={(value) => handleSelectChange('cliente', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {clientes.map(cliente => (
                      <SelectItem key={cliente.id} value={cliente.nome}>{cliente.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="numero_parcelas">Nº de Parcelas *</Label>
                <Input
                  id="numero_parcelas"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.numero_parcelas}
                  onChange={handleChange}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isCrediario && (
        <div>
          <Label htmlFor="cliente">Cliente</Label>
          <Select value={formData.cliente} onValueChange={(value) => handleSelectChange('cliente', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {clientes.map(cliente => (
                <SelectItem key={cliente.id} value={cliente.nome}>{cliente.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {settings?.estoque_ativo && isEntrada && (
        <div>
          <Label htmlFor="produto_id">Produto Vendido (Opcional)</Label>
          <Select value={formData.produto_id} onValueChange={(value) => handleSelectChange('produto_id', value)}>
            <SelectTrigger><SelectValue placeholder="Selecione um produto" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {produtos.filter(p => p.tipo === 'produto').map(produto => (
                <SelectItem key={produto.id} value={produto.id}>{produto.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-400 mt-1">Selecionar um produto aqui dará baixa de 1 unidade no estoque automaticamente.</p>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="gradient-bg">
          {initialData ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};

export default LancamentoForm;