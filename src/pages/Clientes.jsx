import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, List, LayoutGrid, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clienteService } from '@/lib/services/clienteService';
import { useAppContext } from '@/contexts/AppContext';
import { calculations } from '@/lib/utils/calculations';
import { useToast } from '@/components/ui/use-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import ClientesKanbanView from '@/components/clientes/ClientesKanbanView';
import ClientesListView from '@/components/clientes/ClientesListView';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NovoClienteDialog from '@/components/clientes/NovoClienteDialog';
import AtivarRecorrenciaDialog from '@/components/clientes/AtivarRecorrenciaDialog';

function Clientes() {
  const {
    clientes: initialClientes,
    lancamentos,
    etapas,
    settings,
    loading: appContextLoading,
    refreshData
  } = useAppContext();
  const [clientesData, setClientesData] = useState([]);
  const [busca, setBusca] = useState('');
  const [clienteFormOpen, setClienteFormOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [recorrenciaDialog, setRecorrenciaDialog] = useState({
    open: false,
    cliente: null
  });
  const {
    toast
  } = useToast();
  const formatCurrency = value => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
  const processClientesData = useCallback(() => {
    if (initialClientes && lancamentos) {
      const clientesComDados = initialClientes.map(cliente => {
        const dados = calculations.getClientResults(lancamentos, cliente.id);
        return {
          ...cliente,
          ...dados
        };
      });
      setClientesData(clientesComDados);
    }
  }, [initialClientes, lancamentos]);
  useEffect(() => {
    processClientesData();
  }, [processClientesData]);

  const handleSaveCliente = async () => {
    await refreshData();
  };

  const handleAddNew = () => {
    setSelectedCliente(null);
    setClienteFormOpen(true);
  };

  const handleEdit = (cliente) => {
    setSelectedCliente(cliente);
    setClienteFormOpen(true);
  };

  const handleDeleteRequest = cliente => {
    setClienteToDelete(cliente);
    setConfirmOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (!clienteToDelete) return;
    try {
      await clienteService.deleteCliente(clienteToDelete.id);
      toast({
        title: "Sucesso!",
        description: "Cliente removido com sucesso."
      });
      await refreshData();
    } catch (error) {
      toast({
        title: "Erro ao remover cliente",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setConfirmOpen(false);
      setClienteToDelete(null);
    }
  };
  const handleUpdateCliente = async (id, updates) => {
    try {
      await clienteService.updateCliente(id, updates);
      await refreshData();
    } catch (error) {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleSetupRecorrencia = cliente => {
    setRecorrenciaDialog({
      open: true,
      cliente
    });
  };
  const handleConfirmRecorrencia = async ({
    clienteId,
    valorMensal,
    numeroMeses,
    dataInicio
  }) => {
    try {
      await clienteService.setupRecorrencia(clienteId, valorMensal, dataInicio, numeroMeses);
      toast({
        title: "Sucesso!",
        description: `Recorrência configurada para o cliente.`,
        className: "bg-emerald-500 text-white"
      });
      await refreshData();
    } catch (error) {
      throw error;
    }
  };
  const filteredClientes = clientesData.filter(cliente => cliente.nome.toLowerCase().includes(busca.toLowerCase()));
  const totalClientes = filteredClientes.length;
  const totalReceita = filteredClientes.reduce((acc, c) => acc + c.entradas, 0);
  const totalLucro = filteredClientes.reduce((acc, c) => acc + c.lucro, 0);
  if (appContextLoading) {
    return <div className="flex items-center justify-center h-screen bg-slate-900"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div></div>;
  }
  return <div className="space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Clientes</h1>
            <p className="text-gray-400">Gerencie seus clientes e funil de vendas.</p>
          </div>
          <Button className="gradient-bg hover:opacity-90 w-full sm:w-auto" onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </motion.div>

      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.1
    }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 glass-effect rounded-lg"><div className="text-sm text-gray-400">Total de Clientes</div><div className="text-2xl font-bold">{totalClientes}</div></div>
          <div className="p-4 glass-effect rounded-lg"><div className="text-sm text-gray-400">Receita Total</div><div className="text-2xl font-bold text-emerald-400">{formatCurrency(totalReceita)}</div></div>
          <div className="p-4 glass-effect rounded-lg"><div className="text-sm text-gray-400">Lucro Total</div><div className="text-2xl font-bold text-cyan-400">{formatCurrency(totalLucro)}</div></div>
        </div>
      </motion.div>

      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.2
    }}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Buscar cliente..." className="pl-10" value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
          <Tabs value={viewMode} onValueChange={setViewMode} className="w-full sm:w-auto">
            <TabsList className="w-full">
              <TabsTrigger value="list" className="flex-1"><List className="w-4 h-4 mr-2" />Lista</TabsTrigger>
              <TabsTrigger value="kanban" className="flex-1"><LayoutGrid className="w-4 h-4 mr-2" />Kanban</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 0.3
    }}>
        {viewMode === 'list' ? <ClientesListView clientes={filteredClientes} etapas={etapas} onEdit={handleEdit} onDelete={handleDeleteRequest} onUpdateStatus={handleUpdateCliente} onSetupRecorrencia={handleSetupRecorrencia} formatCurrency={formatCurrency} crediarioAtivo={settings?.crediario_ativo} /> : <ClientesKanbanView clientes={filteredClientes} etapas={etapas} setEtapas={refreshData} onUpdateCliente={handleUpdateCliente} onSetupRecorrencia={handleSetupRecorrencia} formatCurrency={formatCurrency} crediarioAtivo={settings?.crediario_ativo} onEdit={handleEdit} />}
      </motion.div>

      <NovoClienteDialog open={clienteFormOpen} onOpenChange={setClienteFormOpen} onConfirm={handleSaveCliente} cliente={selectedCliente} />

      <AtivarRecorrenciaDialog open={recorrenciaDialog.open} onOpenChange={isOpen => setRecorrenciaDialog({
      ...recorrenciaDialog,
      open: isOpen
    })} cliente={recorrenciaDialog.cliente} onConfirm={handleConfirmRecorrencia} />

      <ConfirmationDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={handleDeleteConfirm} title="Confirmar Exclusão" description="Tem certeza que deseja remover este cliente? Todos os lançamentos associados permanecerão, mas o vínculo será perdido." />
    </div>;
}
export default Clientes;