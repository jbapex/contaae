import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, AlertTriangle, Info, Trash2, Edit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { relatorioAgendadoService } from '@/lib/services/relatorioAgendadoService';
import RelatorioAgendadoForm from '@/components/disparos/RelatorioAgendadoForm';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DisparosAutomaticos = () => {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRelatorio, setSelectedRelatorio] = useState(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [relatorioToDelete, setRelatorioToDelete] = useState(null);
  const { toast } = useToast();

  const fetchRelatorios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await relatorioAgendadoService.getRelatoriosAgendados();
      setRelatorios(data);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível carregar os relatórios agendados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRelatorios();
  }, [fetchRelatorios]);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedRelatorio(null);
    fetchRelatorios();
  };

  const handleEdit = (relatorio) => {
    setSelectedRelatorio(relatorio);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (relatorio) => {
    setRelatorioToDelete(relatorio);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!relatorioToDelete) return;
    try {
      await relatorioAgendadoService.deleteRelatorioAgendado(relatorioToDelete.id);
      toast({ title: "Sucesso!", description: "Relatório agendado excluído." });
      fetchRelatorios();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível excluir o relatório.", variant: "destructive" });
    } finally {
      setIsConfirmDeleteDialogOpen(false);
      setRelatorioToDelete(null);
    }
  };

  const getFrequenciaText = (relatorio) => {
    switch (relatorio.frequencia) {
      case 'diario':
        return `Diariamente às ${relatorio.horario_envio.substring(0, 5)}`;
      case 'semanal':
        return `Toda ${relatorio.dia_semana} às ${relatorio.horario_envio.substring(0, 5)}`;
      case 'mensal':
        return `Todo dia ${relatorio.dia_semana} às ${relatorio.horario_envio.substring(0, 5)}`;
      default:
        return 'Não definido';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Seus Agendamentos</h2>
          <p className="text-gray-400">Gerencie seus relatórios automáticos.</p>
        </div>
        <Button onClick={() => { setSelectedRelatorio(null); setIsFormOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Criar Novo Relatório
        </Button>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Ação Necessária para Automação</AlertTitle>
        <AlertDescription>
          Para que os disparos automáticos funcionem, você precisa configurar um Cron Job no seu painel da Supabase para invocar a função de envio.
        </AlertDescription>
      </Alert>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
        </div>
      ) : relatorios.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
          <Card className="max-w-md mx-auto glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <Info className="w-6 h-6 text-cyan-400" />
                <span>Nenhum Relatório Agendado</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Você ainda não criou nenhum disparo automático. Clique no botão acima para começar!</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatorios.map((relatorio, index) => (
            <motion.div key={relatorio.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="glass-effect h-full flex flex-col">
                <CardHeader>
                  <CardTitle>{relatorio.nome}</CardTitle>
                  <CardDescription>{getFrequenciaText(relatorio)}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-gray-400">
                    Período dos dados: <span className="font-semibold text-gray-200">
                      {relatorio.periodo_dados === 0 ? 'Dia atual' : `Últimos ${relatorio.periodo_dados} dias`}
                    </span>
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(relatorio)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteRequest(relatorio)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <RelatorioAgendadoForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        relatorio={selectedRelatorio}
      />

      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onClose={() => setIsConfirmDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        description={`Você tem certeza que deseja excluir o relatório agendado "${relatorioToDelete?.nome}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default DisparosAutomaticos;