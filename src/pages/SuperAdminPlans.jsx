import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, PlusCircle, Package, Loader2, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { planService } from '@/lib/services/planService';
import PlanFormDialog from '@/components/super-admin/PlanFormDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { availableModules } from '@/lib/utils/modules';

const SuperAdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const plansData = await planService.getAllPlans();
      setPlans(plansData);
    } catch (err) {
      toast({
        title: "Erro ao carregar planos",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setIsPlanFormOpen(true);
  };

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setIsPlanFormOpen(true);
  };
  
  const openDeleteDialog = (plan) => {
    setSelectedPlan(plan);
    setIsConfirmDeleteOpen(true);
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    try {
      await planService.deletePlan(selectedPlan.id);
      toast({
        title: 'Sucesso!',
        description: 'Plano removido com sucesso.',
        className: 'bg-emerald-500 text-white',
      });
      fetchPlans();
    } catch (error) {
      toast({
        title: 'Erro ao remover plano',
        description: 'Este plano pode estar em uso por um ou mais usuários.',
        variant: 'destructive',
      });
    } finally {
      setIsConfirmDeleteOpen(false);
      setSelectedPlan(null);
    }
  };
  
  const getModuleLabel = (moduleId) => {
    const module = availableModules.find(m => m.id === moduleId);
    return module ? module.label : moduleId;
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Gerenciamento de Planos</h1>
            <p className="text-gray-400">Crie, edite e gerencie os planos de assinatura.</p>
          </div>
          <Button onClick={handleCreatePlan} className="gradient-bg hover:opacity-90 transition-opacity w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Novo Plano
          </Button>
        </div>

        <Card className="glass-effect border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center"><Package className="mr-2" /> Planos Disponíveis</CardTitle>
            <CardDescription>Estes são os pacotes que podem ser atribuídos aos usuários.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              </div>
            ) : plans.length === 0 ? (
               <div className="text-center py-16 text-gray-400">
                  <Info className="mx-auto h-12 w-12 text-gray-500" />
                  <h3 className="mt-4 text-lg font-medium text-white">Nenhum plano encontrado</h3>
                  <p className="mt-1 text-sm">Comece criando um novo plano para atribuir aos usuários.</p>
                  <Button onClick={handleCreatePlan} className="mt-6">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Primeiro Plano
                  </Button>
                </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-transparent">
                      <TableHead className="text-white">Nome</TableHead>
                      <TableHead className="text-white hidden sm:table-cell">Preço</TableHead>
                      <TableHead className="text-white">Módulos</TableHead>
                      <TableHead className="text-white text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id} className="border-slate-800 hover:bg-slate-800/20">
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">R$ {plan.price.toFixed(2).replace('.', ',')}</TableCell>
                        <TableCell className="max-w-xs sm:max-w-md">
                          <div className="flex flex-wrap gap-1">
                            {plan.modules ? Object.keys(plan.modules).filter(k => plan.modules[k]).map(moduleId => (
                              <Badge key={moduleId} variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                {getModuleLabel(moduleId)}
                              </Badge>
                            )) : <Badge variant="outline">Nenhum</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-effect text-white border-slate-700/50">
                              <DropdownMenuItem onClick={() => handleEditPlan(plan)} className="cursor-pointer"><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDeleteDialog(plan)} className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
                                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá deletar o plano <span className="font-bold text-white">{selectedPlan?.name}</span> permanentemente. Certifique-se de que nenhum usuário está usando este plano.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlan}>Confirmar Exclusão</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PlanFormDialog
        isOpen={isPlanFormOpen}
        onOpenChange={setIsPlanFormOpen}
        plan={selectedPlan}
        onSuccess={() => {
          fetchPlans();
          setSelectedPlan(null);
        }}
      />
    </>
  );
};

export default SuperAdminPlans;