import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Package, PlusCircle, Loader2, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { estoqueService } from '@/lib/services/estoqueService';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProdutoForm from '@/components/estoque/ProdutoForm';
import MovimentoEstoqueForm from '@/components/estoque/MovimentoEstoqueForm';
import HistoricoMovimentos from '@/components/estoque/HistoricoMovimentos';
import EstoqueGrid from '@/components/estoque/EstoqueGrid';
import EstoqueList from '@/components/estoque/EstoqueList';

const Estoque = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [isProdutoFormOpen, setIsProdutoFormOpen] = useState(false);
  const [isMovimentoFormOpen, setIsMovimentoFormOpen] = useState(false);
  const [isHistoricoOpen, setIsHistoricoOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState(null);
  const { toast } = useToast();

  const loadProdutos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await estoqueService.getProdutos();
      setProdutos(data);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível carregar os produtos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadProdutos();
  }, [loadProdutos]);

  const handleSaveProduto = async (produtoData) => {
    try {
      await estoqueService.saveProduto(produtoData);
      toast({ title: "Sucesso!", description: `Item ${produtoData.id ? 'atualizado' : 'criado'} com sucesso.` });
      loadProdutos();
    } catch (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveMovimento = async (movimentoData) => {
    try {
      await estoqueService.addMovimento(movimentoData);
      toast({ title: "Sucesso!", description: "Movimento de estoque registrado." });
      loadProdutos();
    } catch (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = (produto) => {
    setProdutoToDelete(produto);
    setIsConfirmOpen(true);
  };
  
  const confirmDelete = async () => {
    if(!produtoToDelete) return;
    try {
      await estoqueService.deleteProduto(produtoToDelete.id);
      toast({ title: "Sucesso!", description: "Item deletado com sucesso." });
      loadProdutos();
    } catch(error) {
      toast({ title: "Erro", description: "Não foi possível deletar o item. Verifique se há movimentos de estoque associados.", variant: "destructive" });
    } finally {
      setIsConfirmOpen(false);
      setProdutoToDelete(null);
    }
  }

  const handleEdit = (produto) => {
    setSelectedProduto(produto);
    setIsProdutoFormOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedProduto(null);
    setIsProdutoFormOpen(true);
  };

  const handleOpenMovimentoForm = (produto) => {
    setSelectedProduto(produto);
    setIsMovimentoFormOpen(true);
  };

  const handleOpenHistorico = (produto) => {
    setSelectedProduto(produto);
    setIsHistoricoOpen(true);
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6">
       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center">
                <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">Estoque</h1>
              <p className="text-gray-400">Gerencie seus produtos e serviços.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="bg-slate-800 p-1 rounded-lg flex gap-1">
              <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4" /></Button>
              <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
            </div>
            <Button onClick={handleAddNew} className="flex-grow sm:flex-grow-0">
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Item
            </Button>
          </div>
        </div>
      </motion.div>

      {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
      ) : (
        produtos.length > 0 || viewMode === 'list' ? (
          viewMode === 'grid' ? (
            <EstoqueGrid 
              produtos={produtos} 
              onEdit={handleEdit}
              onMovimentar={handleOpenMovimentoForm}
              onHistorico={handleOpenHistorico}
              onDelete={handleDelete}
              formatCurrency={formatCurrency}
            />
          ) : (
            <EstoqueList
              produtos={produtos}
              onMovimentar={handleOpenMovimentoForm}
              onHistorico={handleOpenHistorico}
              onDelete={handleDelete}
              onSave={handleSaveProduto}
              formatCurrency={formatCurrency}
              toast={toast}
            />
          )
        ) : (
          <div className="text-center py-20 bg-slate-800/30 rounded-lg">
            <Package className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-white">Nenhum item no estoque</h3>
            <p className="mt-1 text-sm text-gray-400">Comece cadastrando seu primeiro produto ou serviço.</p>
            <div className="mt-6">
              <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" /> Cadastrar Primeiro Item
              </Button>
            </div>
          </div>
        )
      )}
      
      <Dialog open={isProdutoFormOpen} onOpenChange={setIsProdutoFormOpen}>
        <DialogContent className="sm:max-w-[525px] glass-effect">
          <DialogHeader>
            <DialogTitle>{selectedProduto?.id ? 'Editar Item' : 'Novo Item'}</DialogTitle>
          </DialogHeader>
          <ProdutoForm 
            produto={selectedProduto} 
            onSave={handleSaveProduto} 
            setOpen={setIsProdutoFormOpen} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isMovimentoFormOpen} onOpenChange={setIsMovimentoFormOpen}>
        <DialogContent className="sm:max-w-[425px] glass-effect">
          <DialogHeader>
            <DialogTitle>Movimentar Estoque</DialogTitle>
          </DialogHeader>
          <MovimentoEstoqueForm 
            produto={selectedProduto} 
            onSave={handleSaveMovimento} 
            setOpen={setIsMovimentoFormOpen} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoricoOpen} onOpenChange={setIsHistoricoOpen}>
        <DialogContent className="sm:max-w-[625px] glass-effect">
          <DialogHeader>
            <DialogTitle>Histórico de Movimentos</DialogTitle>
          </DialogHeader>
          <HistoricoMovimentos produto={selectedProduto} />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o item "${produtoToDelete?.nome}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default Estoque;