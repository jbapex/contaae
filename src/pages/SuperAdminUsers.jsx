import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Users, Shield, KeyRound, UserX, Edit } from 'lucide-react';
import { superAdminService } from '@/lib/services/superAdminService';
import UserModulesSheet from '@/components/super-admin/UserModulesSheet';
import { useToast } from '@/components/ui/use-toast';

const SuperAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await superAdminService.getAllUsers();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
  
  const handleManageModules = (user) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
  };
  
  const handleAction = (action) => {
     toast({
        title: "Funcionalidade em desenvolvimento",
        description: `A ação "${action}" ainda não foi implementada.`,
      });
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">Erro ao carregar usuários: {error}</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-gradient">Gestão de Acessos e Permissões</h1>
          <p className="text-gray-400">Gerencie todos os usuários da plataforma.</p>
        </div>

        <Card className="glass-effect border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2" />
              Lista de Usuários ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-800/20">
                    <TableHead className="text-white">Email</TableHead>
                    <TableHead className="text-white">Plano</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/20">
                      <TableCell>
                        <div className="font-medium">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.id}</div>
                      </TableCell>
                       <TableCell>
                        <Badge variant="outline" className="border-emerald-500 text-emerald-500">
                          {user.plan_name || 'Não definido'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         <Badge variant={user.is_super_admin ? 'default' : 'secondary'} className={user.is_super_admin ? 'gradient-bg' : ''}>
                          {user.is_super_admin && <Shield className="w-3 h-3 mr-1" />}
                          {user.account_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-effect text-white border-slate-700/50">
                            <DropdownMenuItem onClick={() => handleManageModules(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Gerenciar Módulos</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('Resetar Senha')}>
                              <KeyRound className="mr-2 h-4 w-4" />
                              <span>Resetar Senha</span>
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleAction('Desativar Conta')} className="text-red-500 focus:text-red-400 focus:bg-red-500/10">
                              <UserX className="mr-2 h-4 w-4" />
                              <span>Desativar Conta</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <UserModulesSheet 
        user={selectedUser}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </>
  );
};

export default SuperAdminUsers;