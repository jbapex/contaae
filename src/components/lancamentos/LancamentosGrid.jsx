import React, { useState } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Save, X, Trash2, Calendar, PlusCircle, Landmark, Package } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
    import { useAppContext } from '@/contexts/AppContext';

    const LancamentosGrid = ({ lancamentos, onUpdate, onCreate, onDelete }) => {
      const { clientes, categorias, contasBancarias, produtos, settings } = useAppContext();
      const [editingRowId, setEditingRowId] = useState(null);
      const [editFormData, setEditFormData] = useState({});
      const [newRow, setNewRow] = useState(createEmptyRow());

      function createEmptyRow() {
        return {
          id: `new-${Date.now()}-${Math.random()}`,
          tipo: 'entrada',
          descricao: '',
          valor: '',
          data: new Date().toISOString().split('T')[0],
          categoria: '',
          cliente: '',
          conta_bancaria_id: '',
          produto_id: '',
        };
      }

      const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      };
      const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      };

      const handleEditClick = (lancamento) => {
        setEditingRowId(lancamento.id);
        setEditFormData({
          ...lancamento,
          data: lancamento.data ? new Date(lancamento.data).toISOString().split('T')[0] : '',
          cliente: lancamento.clienteNome || '',
          categoria: lancamento.categoria || '',
          conta_bancaria_id: lancamento.conta_bancaria_id || '',
          produto_id: lancamento.produto_id || '',
        });
      };

      const handleCancelClick = () => setEditingRowId(null);
      const handleSaveClick = (id) => {
        onUpdate(id, editFormData);
        setEditingRowId(null);
      };
      const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
      };
      const handleEditSelectChange = (name, value) => {
        const isNone = value === 'none' || value === '';
        setEditFormData({ ...editFormData, [name]: isNone ? '' : value, ...(name === 'tipo' && { categoria: '' }) });
      };
      const handleNewRowChange = (e) => {
        const { name, value } = e.target;
        setNewRow(prev => ({ ...prev, [name]: value }));
      };
      const handleNewRowSelectChange = (name, value) => {
        const isNone = value === 'none' || value === '';
        setNewRow(prev => ({ ...prev, [name]: isNone ? '' : value, ...(name === 'tipo' && { categoria: '' }) }));
      };
      const handleCreateClick = () => {
        if (newRow.descricao && newRow.valor) {
          onCreate(newRow);
          setNewRow(createEmptyRow());
        }
      };

      if (lancamentos.length === 0 && !newRow.descricao) {
        return (
          <div className="text-center py-16 text-gray-400 bg-white/5 rounded-lg">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold">Nenhum lançamento encontrado</h3>
            <p className="text-sm">Comece a adicionar lançamentos na tabela abaixo.</p>
          </div>
        );
      }

      const renderEditableRow = (lancamento) => (
        <TableRow key={lancamento.id} className="bg-slate-700/50">
          <TableCell><Select value={editFormData.tipo} onValueChange={(v) => handleEditSelectChange('tipo', v)}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="entrada">Entrada</SelectItem><SelectItem value="saida">Saída</SelectItem></SelectContent></Select></TableCell>
          <TableCell><Input name="descricao" value={editFormData.descricao} onChange={handleEditFormChange} /></TableCell>
          <TableCell><Input type="number" name="valor" value={editFormData.valor} onChange={handleEditFormChange} className="w-28" /></TableCell>
          <TableCell><Input type="date" name="data" value={editFormData.data} onChange={handleEditFormChange} /></TableCell>
          <TableCell>{formatDateTime(lancamento.created_at)}</TableCell>
          <TableCell><Select value={editFormData.cliente || ''} onValueChange={(v) => handleEditSelectChange('cliente', v)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Nenhum</SelectItem>{clientes.filter(c => c.nome).map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}</SelectContent></Select></TableCell>
          <TableCell><Select value={editFormData.categoria || ''} onValueChange={(v) => handleEditSelectChange('categoria', v)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Nenhuma</SelectItem>{editFormData.tipo && categorias[editFormData.tipo === 'entrada' ? 'entradas' : 'saidas']?.filter(cat => cat).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select></TableCell>
          {settings?.contas_bancarias_ativo && <TableCell><Select value={editFormData.conta_bancaria_id || ''} onValueChange={(v) => handleEditSelectChange('conta_bancaria_id', v)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Nenhuma</SelectItem>{contasBancarias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome_banco}</SelectItem>)}</SelectContent></Select></TableCell>}
          {settings?.estoque_ativo && <TableCell><Select value={editFormData.produto_id || ''} onValueChange={(v) => handleEditSelectChange('produto_id', v)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Nenhum</SelectItem>{produtos.filter(p => p.tipo === 'produto').map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent></Select></TableCell>}
          <TableCell className="text-right"><div className="flex gap-2 justify-end"><Button size="icon" onClick={() => handleSaveClick(lancamento.id)} className="bg-emerald-500 hover:bg-emerald-600"><Save className="w-4 h-4" /></Button><Button size="icon" variant="ghost" onClick={handleCancelClick}><X className="w-4 h-4" /></Button></div></TableCell>
        </TableRow>
      );

      const renderStaticRow = (lancamento) => (
        <TableRow key={lancamento.id} onClick={() => handleEditClick(lancamento)} className="cursor-pointer">
          <TableCell><span className={`px-2 py-1 text-xs font-semibold rounded-full ${lancamento.tipo === 'entrada' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{lancamento.tipo === 'entrada' ? 'Entrada' : 'Saída'}</span></TableCell>
          <TableCell className="font-medium">{lancamento.descricao}</TableCell>
          <TableCell className={lancamento.tipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'}>{formatCurrency(parseFloat(lancamento.valor))}</TableCell>
          <TableCell>{formatDate(lancamento.data)}</TableCell>
          <TableCell>{formatDateTime(lancamento.created_at)}</TableCell>
          <TableCell>{lancamento.clienteNome !== 'Nenhum' ? lancamento.clienteNome : '-'}</TableCell>
          <TableCell>{lancamento.categoria !== 'Nenhuma' ? lancamento.categoria : '-'}</TableCell>
          {settings?.contas_bancarias_ativo && <TableCell>{lancamento.conta_bancaria_nome !== 'Nenhuma' ? <span className="flex items-center gap-1.5"><Landmark className="w-3 h-3" />{lancamento.conta_bancaria_nome}</span> : '-'}</TableCell>}
          {settings?.estoque_ativo && <TableCell>{lancamento.produto_nome ? <span className="flex items-center gap-1.5"><Package className="w-3 h-3" />{lancamento.produto_nome}</span> : '-'}</TableCell>}
          <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(lancamento.id); }} className="text-red-500/70 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button></TableCell>
        </TableRow>
      );

      const renderNewRow = () => (
        <TableRow key={newRow.id}>
          <TableCell><Select value={newRow.tipo} onValueChange={(v) => handleNewRowSelectChange('tipo', v)}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="entrada">Entrada</SelectItem><SelectItem value="saida">Saída</SelectItem></SelectContent></Select></TableCell>
          <TableCell><Input placeholder="Nova descrição..." name="descricao" value={newRow.descricao} onChange={handleNewRowChange} /></TableCell>
          <TableCell><Input type="number" placeholder="0,00" name="valor" value={newRow.valor} onChange={handleNewRowChange} className="w-28" /></TableCell>
          <TableCell><Input type="date" name="data" value={newRow.data} onChange={handleNewRowChange} /></TableCell>
          <TableCell></TableCell>
          <TableCell><Select value={newRow.cliente || ''} onValueChange={(v) => handleNewRowSelectChange('cliente', v)}><SelectTrigger className="w-40"><SelectValue placeholder="Cliente" /></SelectTrigger><SelectContent><SelectItem value="none">Nenhum</SelectItem>{clientes.filter(c => c.nome).map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}</SelectContent></Select></TableCell>
          <TableCell><Select value={newRow.categoria || ''} onValueChange={(v) => handleNewRowSelectChange('categoria', v)}><SelectTrigger className="w-40"><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent><SelectItem value="none">Nenhuma</SelectItem>{newRow.tipo && categorias[newRow.tipo === 'entrada' ? 'entradas' : 'saidas']?.filter(cat => cat).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select></TableCell>
          {settings?.contas_bancarias_ativo && <TableCell><Select value={newRow.conta_bancaria_id || ''} onValueChange={(v) => handleNewRowSelectChange('conta_bancaria_id', v)}><SelectTrigger className="w-40"><SelectValue placeholder="Conta" /></SelectTrigger><SelectContent><SelectItem value="none">Nenhuma</SelectItem>{contasBancarias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome_banco}</SelectItem>)}</SelectContent></Select></TableCell>}
          {settings?.estoque_ativo && <TableCell><Select value={newRow.produto_id || ''} onValueChange={(v) => handleNewRowSelectChange('produto_id', v)}><SelectTrigger className="w-40"><SelectValue placeholder="Produto" /></SelectTrigger><SelectContent><SelectItem value="none">Nenhum</SelectItem>{produtos.filter(p => p.tipo === 'produto').map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent></Select></TableCell>}
          <TableCell className="text-right">{newRow.descricao && newRow.valor && (<Button size="sm" onClick={handleCreateClick} className="bg-emerald-500 hover:bg-emerald-600"><PlusCircle className="w-4 h-4 mr-2" />Salvar</Button>)}</TableCell>
        </TableRow>
      );

      return (
        <div className="bg-white/5 rounded-lg p-2 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Categoria</TableHead>
                {settings?.contas_bancarias_ativo && <TableHead>Conta</TableHead>}
                {settings?.estoque_ativo && <TableHead>Produto/Serviço</TableHead>}
                <TableHead className="text-right w-28">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderNewRow()}
              <AnimatePresence>
                {lancamentos.map((lancamento) => (
                  editingRowId === lancamento.id ? renderEditableRow(lancamento) : renderStaticRow(lancamento)
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      );
    };

    export default LancamentosGrid;