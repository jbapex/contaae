import React, { useState, useEffect } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { useToast } from '@/components/ui/use-toast';
    import { superAdminService } from '@/lib/services/superAdminService';

    const ChangeUserPlanDialog = ({ isOpen, onOpenChange, user, plans, onSuccess }) => {
      const [selectedPlanId, setSelectedPlanId] = useState('');
      const [loading, setLoading] = useState(false);
      const { toast } = useToast();

      useEffect(() => {
        if (user) {
          setSelectedPlanId(user.plan_id || '');
        }
      }, [user]);

      const handleSave = async () => {
        if (!selectedPlanId) {
          toast({ title: 'Nenhum plano selecionado', variant: 'destructive' });
          return;
        }
        setLoading(true);
        try {
          await superAdminService.updateUserPlan(user.id, selectedPlanId);
          toast({
            title: 'Sucesso!',
            description: `Plano do usuário ${user.email} atualizado.`,
            className: 'bg-green-500 text-white',
          });
          onSuccess();
          onOpenChange(false);
        } catch (error) {
          toast({
            title: 'Erro ao alterar plano',
            description: error.message,
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      };

      if (!user) return null;

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="glass-effect text-white border-slate-700/50">
            <DialogHeader>
              <DialogTitle className="text-gradient">Alterar Plano do Usuário</DialogTitle>
              <DialogDescription className="text-gray-400">
                Selecione um novo plano para <span className="font-bold text-white">{user.email}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent className="glass-effect border-slate-700/50">
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>{plan.name} - R$ {plan.price.toFixed(2)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={loading} className="gradient-bg">
                {loading ? 'Salvando...' : 'Salvar Alteração'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default ChangeUserPlanDialog;