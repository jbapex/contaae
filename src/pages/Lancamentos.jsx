import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, List, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { lancamentoService } from '@/lib/services/lancamentoService';
import { useToast } from '@/components/ui/use-toast';
import LancamentoForm from '@/components/lancamentos/LancamentoForm';
import LancamentosFilters from '@/components/lancamentos/LancamentosFilters';
import LancamentosList from '@/components/lancamentos/LancamentosList';
import LancamentosGrid from '@/components/lancamentos/LancamentosGrid';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { useAppContext } from '@/contexts/AppContext';
import useMediaQuery from '@/hooks/useMediaQuery';
import { subDays, startOfMonth, endOfMonth } from 'date-fns';

function Lancamentos() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [viewMode, setViewMode] = useState('grid');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lancamentoToDelete, setLancamentoToDelete] = useState(null);
  const { toast } = useToast();
  const { settings, refreshData: refreshAppContext } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    busca: '',
    tipo: 'todos',
    categoria: 'todas',
    cliente: 'todos',
    contaBancaria: 'todas',
    periodo: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    },
  });

  const fetchLancamentos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await lancamentoService.getLancamentos({ periodo: filters.periodo });
      setLancamentos(data);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível carregar os lançamentos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [filters.periodo, toast]);

  useEffect(() => {
    fetchLancamentos();
  }, [fetchLancamentos]);

  const refreshAllData = async () => {
    await fetchLancamentos();
    await refreshAppContext();
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('action') === 'new') {
      setEditingLancamento(null);
      setDialogOpen(true);
      navigate('/lancamentos', { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    setViewMode(isMobile ? 'list' : 'grid');
  }, [isMobile]);

  const handleFormSubmit = async formData => {
    try {
      if (editingLancamento) {
        await lancamentoService.updateLancamento(editingLancamento.id, formData);
        toast({
          title: "Sucesso!",
          description: "Lançamento atualizado com sucesso"
        });
      } else {
        await lancamentoService.saveLancamento(formData);
        toast({
          title: "Sucesso!",
          description: formData.tipo === 'crediario' ? "Venda em crediário registrada com sucesso!" : "Lançamento criado com sucesso"
        });
      }
      await refreshAllData();
      setDialogOpen(false);
      setEditingLancamento(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao salvar lançamento: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  const handleDeleteRequest = id => {
    setLancamentoToDelete(id);
    setConfirmOpen(true);
  };
  const handleDelete = async () => {
    if (lancamentoToDelete) {
      await lancamentoService.deleteLancamento(lancamentoToDelete);
      await refreshAllData();
      toast({
        title: "Sucesso!",
        description: "Lançamento excluído com sucesso"
      });
    }
    setConfirmOpen(false);
    setLancamentoToDelete(null);
  };
  const handleEdit = lancamento => {
    setEditingLancamento(lancamento);
    setDialogOpen(true);
  };
  const handleOpenDialog = () => {
    setEditingLancamento(null);
    setDialogOpen(true);
  };
  const handleGridUpdate = async (id, updatedData) => {
    try {
      await lancamentoService.updateLancamento(id, updatedData);
      await refreshAllData();
      toast({
        title: "Salvo!",
        description: "Lançamento atualizado.",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o lançamento.",
        variant: "destructive"
      });
    }
  };
  const handleGridCreate = async newLancamento => {
    try {
      await lancamentoService.saveLancamento(newLancamento);
      await refreshAllData();
      toast({
        title: "Sucesso!",
        description: "Novo lançamento adicionado."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o lançamento.",
        variant: "destructive"
      });
    }
  };

  const displayedLancamentos = useMemo(() => {
    return lancamentos.filter(lancamento => {
      const matchesBusca = lancamento.descricao.toLowerCase().includes(filters.busca.toLowerCase()) || (lancamento.clienteNome && lancamento.clienteNome.toLowerCase().includes(filters.busca.toLowerCase()));
      const matchesTipo = filters.tipo === 'todos' || lancamento.tipo === filters.tipo;
      const matchesCliente = filters.cliente === 'todos' || lancamento.cliente_id === filters.cliente;
      const matchesCategoria = filters.categoria === 'todas' || lancamento.categoria_id === filters.categoria;
      const matchesConta = !settings?.contas_bancarias_ativo || filters.contaBancaria === 'todas' || lancamento.conta_bancaria_id === filters.contaBancaria;

      return matchesBusca && matchesTipo && matchesCliente && matchesCategoria && matchesConta;
    });
  }, [lancamentos, filters, settings]);

  return <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gradient">Lançamentos</h1>
              <p className="text-gray-400">Gerencie todas as entradas e saídas</p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
               {!isMobile && (
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
                  <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                    <List className="w-4 h-4" />
                  </Button>
                  <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                </div>
               )}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-bg hover:opacity-90 w-full" onClick={handleOpenDialog}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Lançamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-effect border-white/20">
                  <DialogHeader>
                    <DialogTitle>
                      {editingLancamento ? 'Editar Lançamento' : 'Novo Lançamento'}
                    </DialogTitle>
                  </DialogHeader>
                  <LancamentoForm onSubmit={handleFormSubmit} initialData={editingLancamento} onCancel={() => setDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          <LancamentosFilters filters={filters} setFilters={setFilters} onApplyFilters={fetchLancamentos} />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {loading ? <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div> : <AnimatePresence mode="wait">
                <motion.div key={viewMode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  {viewMode === 'list' ? <LancamentosList lancamentos={displayedLancamentos} onEdit={handleEdit} onDelete={handleDeleteRequest} /> : <LancamentosGrid lancamentos={displayedLancamentos} onUpdate={handleGridUpdate} onCreate={handleGridCreate} onDelete={handleDeleteRequest} />}
                </motion.div>
              </AnimatePresence>}
          </motion.div>

          <ConfirmationDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={handleDelete} title="Tem certeza que deseja excluir este lançamento?" description="Esta ação não pode ser desfeita. Este lançamento será removido permanentemente." />
        </div>;
}
export default Lancamentos;