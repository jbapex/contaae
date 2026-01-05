import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, ArrowRightLeft, History, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const EstoqueList = ({ 
  produtos, 
  onMovimentar, 
  onHistorico, 
  onDelete, 
  onSave, 
  formatCurrency, 
  toast 
}) => {
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingRowData, setEditingRowData] = useState({});
  const [newProdutoData, setNewProdutoData] = useState({
    nome: '', tipo: 'produto', preco_venda: '', preco_custo: '', quantidade_estoque: 0, ativo: true
  });

  const handleEditRow = (produto) => {
    setEditingRowId(produto.id);
    setEditingRowData(produto);
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingRowData({});
  };

  const handleEditingRowChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingRowData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  
  const handleEditingRowSelectChange = (name, value) => {
    setEditingRowData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewProdutoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProdutoData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleNewProdutoSelectChange = (name, value) => {
    setNewProdutoData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async (data) => {
    await onSave(data);
    handleCancelEdit();
  };

  const handleQuickAdd = async () => {
    if (!newProdutoData.nome) {
      toast({ title: "Erro", description: "O nome do item é obrigatório.", variant: "destructive" });
      return;
    }
    await onSave(newProdutoData);
    setNewProdutoData({ nome: '', tipo: 'produto', preco_venda: '', preco_custo: '', quantidade_estoque: 0, ativo: true });
  };

  return (
    <div className="bg-slate-800/30 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Estoque</th>
              <th className="p-4">Preço Custo</th>
              <th className="p-4">Preço Venda</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(produto => (
              editingRowId === produto.id ? (
                <tr key={produto.id} className="bg-slate-800/50">
                  <td className="p-2"><Input name="nome" value={editingRowData.nome} onChange={handleEditingRowChange} className="h-8" /></td>
                  <td className="p-2">
                    <Select name="tipo" value={editingRowData.tipo} onValueChange={(v) => handleEditingRowSelectChange('tipo', v)}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="produto">Produto</SelectItem><SelectItem value="servico">Serviço</SelectItem></SelectContent>
                    </Select>
                  </td>
                  <td className="p-2"><Input name="quantidade_estoque" type="number" value={editingRowData.quantidade_estoque} onChange={handleEditingRowChange} className="h-8" disabled={editingRowData.tipo === 'servico'} /></td>
                  <td className="p-2"><Input name="preco_custo" type="number" value={editingRowData.preco_custo} onChange={handleEditingRowChange} className="h-8" /></td>
                  <td className="p-2"><Input name="preco_venda" type="number" value={editingRowData.preco_venda} onChange={handleEditingRowChange} className="h-8" /></td>
                  <td className="p-2"><div className="flex items-center justify-center"><Switch name="ativo" checked={editingRowData.ativo} onCheckedChange={(c) => handleEditingRowSelectChange('ativo', c)} /></div></td>
                  <td className="p-2 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" onClick={() => handleSave(editingRowData)}>Salvar</Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancelar</Button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={produto.id} className="border-b border-slate-700/50 hover:bg-slate-800/40">
                  <td className="p-4 font-medium">{produto.nome}</td>
                  <td className="p-4 capitalize">{produto.tipo}</td>
                  <td className="p-4">{produto.tipo === 'produto' ? `${produto.quantidade_estoque} ${produto.unidade_medida || 'un'}` : 'N/A'}</td>
                  <td className="p-4">{formatCurrency(produto.preco_custo)}</td>
                  <td className="p-4 text-emerald-400">{formatCurrency(produto.preco_venda)}</td>
                  <td className="p-4"><Badge variant={produto.ativo ? 'success' : 'destructive'}>{produto.ativo ? 'Ativo' : 'Inativo'}</Badge></td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => handleEditRow(produto)}>Editar</Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {produto.tipo === 'produto' && <DropdownMenuItem onClick={() => onMovimentar(produto)}><ArrowRightLeft className="mr-2 h-4 w-4" /> Movimentar</DropdownMenuItem>}
                          {produto.tipo === 'produto' && <DropdownMenuItem onClick={() => onHistorico(produto)}><History className="mr-2 h-4 w-4" /> Histórico</DropdownMenuItem>}
                          <DropdownMenuItem onClick={() => onDelete(produto)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Deletar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              )
            ))}
            <tr className="bg-slate-900/50">
              <td className="p-2"><Input name="nome" placeholder="Nome do novo item" value={newProdutoData.nome} onChange={handleNewProdutoChange} className="h-8" /></td>
              <td className="p-2">
                <Select name="tipo" value={newProdutoData.tipo} onValueChange={(v) => handleNewProdutoSelectChange('tipo', v)}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="produto">Produto</SelectItem><SelectItem value="servico">Serviço</SelectItem></SelectContent>
                </Select>
              </td>
              <td className="p-2"><Input name="quantidade_estoque" type="number" placeholder="Qtd" value={newProdutoData.quantidade_estoque} onChange={handleNewProdutoChange} className="h-8" disabled={newProdutoData.tipo === 'servico'} /></td>
              <td className="p-2"><Input name="preco_custo" type="number" placeholder="Custo" value={newProdutoData.preco_custo} onChange={handleNewProdutoChange} className="h-8" /></td>
              <td className="p-2"><Input name="preco_venda" type="number" placeholder="Venda" value={newProdutoData.preco_venda} onChange={handleNewProdutoChange} className="h-8" /></td>
              <td className="p-2"><div className="flex items-center justify-center"><Switch name="ativo" checked={newProdutoData.ativo} onCheckedChange={(c) => handleNewProdutoSelectChange('ativo', c)} /></div></td>
              <td className="p-2 text-right"><Button size="sm" onClick={handleQuickAdd}>Adicionar</Button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EstoqueList;