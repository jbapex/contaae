import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Shield, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { superAdminService } from '@/lib/services/superAdminService';
import { planService } from '@/lib/services/planService';

const SuperAdminUsersAndPlans = () => {
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState({ users: true, plans: true });
  const [updatingPlan, setUpdatingPlan] = useState(null);
  const { toast } = useToast();

  const fetchAllData = useCallback(async () => {
    try {
      setLoading({ users: true, plans: true });
      const [usersData, plansData] = await Promise.all([
        superAdminService.getAllUsers(),
        planService.getAllPlans()
      ]);
      setUsers(usersData);
      setPlans(plansData);
    } catch (err) {
      toast({
        title: "Erro ao carregar dados",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading({ users: false, plans: false });
    }
  }, [toast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handlePlanChange = async (userId, newPlanId) => {
    setUpdatingPlan(userId);
    try {
      await superAdminService.updateUserPlan(userId, newPlanId);
      toast({
        title: 'Sucesso!',
        description: 'Plano do usuário atualizado.',
        className: 'bg-green-500 text-white',
      });
      // Update local state to reflect the change immediately
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, plan_id: newPlanId, plan_name: plans.find(p => p.id === newPlanId)?.name } : user
        )
      );
    } catch (error) {
      toast({
        title: 'Erro ao alterar plano',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingPlan(null);
    }
  };

  const isLoading = loading.users || loading.plans;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Usuários e Planos</h1>
        <p className="text-gray-400">Gerencie os planos de cada usuário da plataforma.</p>
      </div>

      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="mr-2" /> Usuários ({users.length})</CardTitle>
          <CardDescription>Altere o plano de um usuário selecionando uma nova opção na lista.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-white">Usuário</TableHead>
                    <TableHead className="text-white hidden sm:table-cell">Status</TableHead>
                    <TableHead className="text-white w-[180px] sm:w-[250px]">Plano</TableHead>
                    <TableHead className="text-white hidden md:table-cell">Data de Criação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/20">
                      <TableCell>
                        <div className="font-medium truncate max-w-[15ch] sm:max-w-none">{user.email}</div>
                        <div className="text-xs text-gray-400">{user.is_super_admin ? 'Super Admin' : 'Usuário Padrão'}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={user.account_status === 'active' ? 'success' : 'warning'}>
                          {user.account_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {updatingPlan === user.id ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Atualizando...</span>
                          </div>
                        ) : (
                          <Select
                            value={user.plan_id || ''}
                            onValueChange={(newPlanId) => handlePlanChange(user.id, newPlanId)}
                            disabled={user.is_super_admin}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione um plano" />
                            </SelectTrigger>
                            <SelectContent className="glass-effect border-slate-700/50">
                              {plans.map(plan => (
                                <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminUsersAndPlans;