import React, { useState, useEffect, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { Settings, Users, List, FileText } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { dataService } from '@/lib/services/dataService';
    import { lancamentoService } from '@/lib/services/lancamentoService';
    import { clienteService } from '@/lib/services/clienteService';
    import { categoriaService } from '@/lib/services/categoriaService';
    import { etapaService } from '@/lib/services/etapaService';
    import StatsCard from '@/components/configuracoes/StatsCard';
    import CategoriasCard from '@/components/configuracoes/CategoriasCard';
    import ClientesCard from '@/components/configuracoes/ClientesCard';
    import EtapasCard from '@/components/configuracoes/EtapasCard';
    import DataManagementCard from '@/components/configuracoes/DataManagementCard';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
    import ImportacaoMassa from "@/components/configuracoes/ImportacaoMassa";
    import ImportacaoCategorias from "@/components/configuracoes/ImportacaoCategorias";
    import ProfileCard from '@/components/configuracoes/ProfileCard';
    import { useAppContext } from '@/contexts/AppContext';
    import AddEditDialog from '@/components/configuracoes/AddEditDialog';
    import SelectiveClearDialog from '@/components/configuracoes/SelectiveClearDialog';

    function Configuracoes() {
      const { toast } = useToast();
      const { refreshData } = useAppContext();
      const [stats, setStats] = useState({ lancamentos: 0, clientes: 0, categorias: 0 });
      const [categorias, setCategorias] = useState({ entradas: [], saidas: [] });
      const [clientes, setClientes] = useState([]);
      const [etapas, setEtapas] = useState([]);
      const [isSelectiveClearOpen, setSelectiveClearOpen] = useState(false);
      const [isImportModalOpen, setImportModalOpen] = useState(false);
      const [isCategoriaImportModalOpen, setCategoriaImportModalOpen] = useState(false);
      const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
      const [editingItem, setEditingItem] = useState(null);

      const fetchData = useCallback(async () => {
        try {
          const [lancamentosData, clientesData, categoriasData, etapasData] = await Promise.all([
            lancamentoService.getLancamentos(),
            clienteService.getClientes(),
            categoriaService.getCategorias(),
            etapaService.getEtapas()
          ]);
          
          setStats({
            lancamentos: lancamentosData.length,
            clientes: clientesData.length,
            categorias: categoriasData.entradas.length + categoriasData.saidas.length,
          });
          setCategorias(categoriasData);
          setClientes(clientesData);
          setEtapas(etapasData);
        } catch (error) {
          toast({
            title: "Erro ao carregar dados",
            description: "Não foi possível buscar os dados de configuração.",
            variant: "destructive",
          });
        }
      }, [toast]);

      useEffect(() => {
        fetchData();
      }, [fetchData]);
      
      const handleOpenAddEditModal = (itemType, itemData = null) => {
        setEditingItem({ type: itemType, data: itemData });
        setAddEditModalOpen(true);
      };

      const handleCloseAddEditModal = () => {
        setAddEditModalOpen(false);
        setEditingItem(null);
      };
      
      const handleSaveItem = async (itemType, itemData) => {
        try {
          let successMessage = '';
          if (itemType === 'categoria') {
            await categoriaService.saveCategoria(itemData.tipo, itemData.nome);
            successMessage = 'Categoria salva com sucesso!';
          } else if (itemType === 'etapa') {
            const newOrder = etapas.length > 0 ? Math.max(...etapas.map(e => e.ordem)) + 1 : 0;
            await etapaService.saveEtapa({ nome: itemData.nome, ordem: newOrder });
            successMessage = 'Etapa salva com sucesso!';
          }
          
          toast({
            title: 'Sucesso!',
            description: successMessage,
            className: 'bg-emerald-500 text-white',
          });

          fetchData();
          handleCloseAddEditModal();
        } catch (error) {
          toast({
            title: `Erro ao salvar ${itemType}`,
            description: error.message,
            variant: 'destructive',
          });
        }
      };

      const handleSelectiveClear = async (itemsToClear) => {
        try {
          await dataService.clearSelectedData(itemsToClear);
          await fetchData();
          toast({
            title: "Dados Apagados!",
            description: "Os dados selecionados foram removidos com sucesso.",
            className: "bg-emerald-500 text-white"
          });
        } catch (error) {
          toast({
            title: "Erro ao apagar dados",
            description: error.message,
            variant: "destructive",
          });
        }
        setSelectiveClearOpen(false);
      };

      const handleExportData = async () => {
        try {
          toast({
            title: "Exportando dados...",
            description: "Aguarde enquanto preparamos seu arquivo CSV.",
          });

          await dataService.exportToCsv();

          toast({
            title: "Backup exportado!",
            description: "Seu arquivo CSV de lançamentos foi baixado.",
            className: "bg-emerald-500 text-white",
          });

        } catch (error) {
          console.error("Erro ao exportar dados:", error);
          toast({
            title: "Erro na exportação",
            description: "Não foi possível gerar o arquivo de backup.",
            variant: "destructive",
          });
        }
      };

      const handleImportSuccess = () => {
        fetchData();
        setImportModalOpen(false);
      };

      const handleCategoriaImportSuccess = () => {
        fetchData();
        setCategoriaImportModalOpen(false);
      };

      const handleModuleUpdate = () => {
        fetchData();
        refreshData();
      }

      const handleDeleteCategoria = async (tipo, nome) => {
        try {
          const tipoBackend = tipo === 'entradas' ? 'entrada' : 'saida';
          await categoriaService.deleteCategoria(nome, tipoBackend);
          toast({
            title: 'Categoria removida!',
            description: `A categoria "${nome}" foi removida com sucesso.`,
            className: 'bg-emerald-500 text-white',
          });
          fetchData();
        } catch (error) {
          toast({
            title: 'Erro ao remover categoria',
            description: error.message,
            variant: 'destructive',
          });
        }
      };
      
      const handleDeleteCliente = async (nome) => {
        try {
          const cliente = clientes.find(c => c.nome === nome);
          if (!cliente) throw new Error("Cliente não encontrado");
          await clienteService.deleteCliente(cliente.id);
          toast({
            title: 'Cliente removido!',
            description: `O cliente "${nome}" foi removido com sucesso.`,
            className: 'bg-emerald-500 text-white',
          });
          fetchData();
        } catch (error) {
          toast({
            title: 'Erro ao remover cliente',
            description: error.message,
            variant: 'destructive',
          });
        }
      };

      const handleDeleteEtapa = async (etapa) => {
        try {
          await etapaService.deleteEtapa(etapa.id);
          toast({
            title: 'Etapa removida!',
            description: `A etapa "${etapa.nome}" foi removida com sucesso.`,
            className: 'bg-emerald-500 text-white',
          });
          fetchData();
        } catch (error) {
          toast({
            title: 'Erro ao remover etapa',
            description: error.message,
            variant: 'destructive',
          });
        }
      };

      return (
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3"
          >
            <Settings className="w-10 h-10 text-fuchsia-400" />
            <div>
              <h1 className="text-3xl font-bold text-gradient">Configurações</h1>
              <p className="text-gray-400">Gerencie os dados e as preferências do seu sistema.</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard icon={FileText} title="Lançamentos" value={stats.lancamentos} delay={0.1} />
            <StatsCard icon={Users} title="Clientes" value={stats.clientes} delay={0.2} />
            <StatsCard icon={List} title="Categorias" value={stats.categorias} delay={0.3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <ProfileCard />
              <CategoriasCard 
                categorias={categorias} 
                onAdd={() => handleOpenAddEditModal('categoria')}
                onDelete={handleDeleteCategoria}
                onImport={() => setCategoriaImportModalOpen(true)}
              />
              <ClientesCard clientes={clientes.map(c => c.nome)} onDelete={handleDeleteCliente} onAdd={() => toast({ title: 'Em breve!', description: 'A adição de clientes por aqui será implementada em breve.'})} />
              <EtapasCard 
                etapas={etapas} 
                onAdd={() => handleOpenAddEditModal('etapa')}
                onDelete={handleDeleteEtapa}
              />
            </div>
            <div className="space-y-8">
              <DataManagementCard 
                onExport={handleExportData}
                onImport={() => setImportModalOpen(true)}
                onClear={() => setSelectiveClearOpen(true)} 
              />
            </div>
          </div>

          <SelectiveClearDialog
            isOpen={isSelectiveClearOpen}
            onClose={() => setSelectiveClearOpen(false)}
            onConfirm={handleSelectiveClear}
          />

          {isAddEditModalOpen && (
            <AddEditDialog
              isOpen={isAddEditModalOpen}
              onClose={handleCloseAddEditModal}
              onSave={handleSaveItem}
              itemType={editingItem?.type}
              itemData={editingItem?.data}
            />
          )}

          <Dialog open={isImportModalOpen} onOpenChange={setImportModalOpen}>
            <DialogContent className="sm:max-w-[625px] glass-effect">
              <DialogHeader>
                <DialogTitle className="text-2xl text-gradient">Importação de Lançamentos em Massa</DialogTitle>
                <DialogDescription>
                  Envie um arquivo CSV para adicionar múltiplos lançamentos de uma só vez.
                </DialogDescription>
              </DialogHeader>
              <ImportacaoMassa setOpen={setImportModalOpen} onImportSuccess={handleImportSuccess} />
            </DialogContent>
          </Dialog>

          <Dialog open={isCategoriaImportModalOpen} onOpenChange={setCategoriaImportModalOpen}>
            <DialogContent className="sm:max-w-[625px] glass-effect">
              <DialogHeader>
                <DialogTitle className="text-2xl text-gradient">Importação de Categorias em Massa</DialogTitle>
                <DialogDescription>
                  Envie um arquivo CSV para adicionar múltiplas categorias de uma só vez.
                </DialogDescription>
              </DialogHeader>
              <ImportacaoCategorias setOpen={setCategoriaImportModalOpen} onImportSuccess={handleCategoriaImportSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      );
    }

    export default Configuracoes;