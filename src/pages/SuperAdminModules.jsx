import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Grid3X3, Edit, Loader2, Info } from 'lucide-react';
import { superAdminService } from '@/lib/services/superAdminService';
import { useToast } from '@/components/ui/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import UserModulesManager from '@/components/super-admin/UserModulesManager';

const SuperAdminModules = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
      toast({ title: "Erro ao buscar usuários", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const handleManageModules = (user) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Gerenciamento de Módulos</h1>
          <p className="text-gray-400">Ative ou desative módulos para cada usuário da plataforma. As alterações aqui sobrescrevem as permissões do plano.</p>
        </div>

        <Card className="glass-effect border-white/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Grid3X3 className="mr-2" />
                Usuários ({filteredUsers.length})
              </CardTitle>
              <Input
                placeholder="Buscar por email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Info className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-4 text-lg font-medium text-white">Nenhum usuário encontrado</h3>
                <p className="mt-1 text-sm">Não há usuários correspondentes à sua busca.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-transparent">
                      <TableHead className="text-white">Email</TableHead>
                      <TableHead className="text-white">Plano</TableHead>
                      <TableHead className="text-white text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/20">
                        <TableCell>
                          <div className="font-medium">{user.email}</div>
                        </TableCell>
                         <TableCell>
                          <Badge variant="outline" className="border-emerald-500 text-emerald-500">
                            {user.plan_name || 'Não definido'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <Button variant="outline" size="sm" onClick={() => handleManageModules(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Gerenciar Módulos
                           </Button>
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

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="glass-effect w-full sm:w-[540px] sm:max-w-none overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-gradient">Gerenciar Módulos</SheetTitle>
            <SheetDescription>
              Ajuste os módulos ativos para o usuário selecionado.
            </SheetDescription>
          </SheetHeader>
          {selectedUser && <UserModulesManager user={selectedUser} onModulesUpdate={fetchUsers} />}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default SuperAdminModules;