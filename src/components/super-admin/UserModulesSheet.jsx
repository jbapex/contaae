import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { superAdminService } from '@/lib/services/superAdminService';

const ALL_MODULES = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'lancamentos', label: 'Lançamentos' },
    { id: 'contas_receber', label: 'Contas a Receber' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'fornecedores', label: 'Fornecedores' },
    { id: 'recorrentes', label: 'Recorrentes' },
    { id: 'relatorios', label: 'Relatórios' },
    { id: 'dre', label: 'DRE' },
    { id: 'fluxo_de_caixa', label: 'Fluxo de Caixa' },
    { id: 'planejamento_orcamentario', label: 'Planejamento' },
    { id: 'ia', label: 'Inteligência Artificial (IA)' },
    { id: 'disparos', label: 'Disparos' },
    { id: 'configuracoes', label: 'Configurações' },
];

const UserModulesSheet = ({ user, isOpen, onOpenChange }) => {
  const [modules, setModules] = useState({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user && isOpen) {
      setLoading(true);
      superAdminService.getUserModules(user.id)
        .then(data => setModules(data || {}))
        .catch(error => {
          toast({
            title: 'Erro ao buscar módulos',
            description: error.message,
            variant: 'destructive'
          });
        })
        .finally(() => setLoading(false));
    }
  }, [user, isOpen, toast]);

  const handleModuleChange = (moduleId, checked) => {
    setModules(prev => ({ ...prev, [moduleId]: checked }));
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      await superAdminService.updateUserModules(user.id, modules);
      toast({
        title: 'Sucesso!',
        description: `Módulos do usuário ${user.email} atualizados.`,
        className: 'bg-green-500 text-white',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="glass-effect text-white border-slate-700/50">
        <SheetHeader>
          <SheetTitle className="text-gradient">Gerenciar Módulos</SheetTitle>
          <SheetDescription className="text-gray-400">
            Ative ou desative módulos para o usuário: <br />
            <span className="font-bold text-white">{user.email}</span>
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          {loading ? (
            <div className="text-center">Carregando módulos...</div>
          ) : (
            ALL_MODULES.map(module => (
              <div key={module.id} className="flex items-center justify-between">
                <Label htmlFor={module.id} className="text-base">{module.label}</Label>
                <Switch
                  id={module.id}
                  checked={modules[module.id] || false}
                  onCheckedChange={(checked) => handleModuleChange(module.id, checked)}
                />
              </div>
            ))
          )}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
          <Button onClick={handleSaveChanges} disabled={loading} className="gradient-bg">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default UserModulesSheet;