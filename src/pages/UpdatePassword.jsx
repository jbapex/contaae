import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, KeyRound } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const UpdatePassword = () => {
  const { updateUserPassword, session } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!session) {
      toast({
        title: "Sessão inválida",
        description: "O link de redefinição pode ter expirado. Por favor, tente novamente.",
        variant: "destructive",
      });
      navigate('/forgot-password');
    }
  }, [session, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await updateUserPassword(password);

    if (error) {
      toast({
        title: "Erro ao atualizar senha",
        description: "Não foi possível redefinir sua senha. Tente novamente.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi redefinida com sucesso. Faça login com sua nova senha.",
      });
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-effect border-white/20">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-500/20 p-3 rounded-full mb-4 inline-block">
             <KeyRound className="w-8 h-8 text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-gradient">Redefinir Senha</CardTitle>
          <CardDescription className="text-gray-400">Crie uma nova senha para sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2"><Lock className="w-4 h-4" />Nova Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-800/50 border-gray-700"
              />
            </div>
            <Button type="submit" className="w-full gradient-bg font-bold" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Nova Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UpdatePassword;