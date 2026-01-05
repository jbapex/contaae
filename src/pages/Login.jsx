import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, AtSign, Lock, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { migrateLocalStorageToSupabase } from '@/lib/data-migration';

const Login = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user: signedInUser }, error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Erro no Login",
        description: "Email ou senha inválidos. Por favor, tente novamente.",
        variant: "destructive",
      });
      setLoading(false);
    } else {
      toast({
          title: "Login bem-sucedido!",
          description: "Bem-vindo de volta!",
      });
      
      if (signedInUser && signedInUser.email === 'josiasbonfim61@gmail.com') {
        await migrateLocalStorageToSupabase(signedInUser);
      }

      navigate('/');
    }
  };

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-effect border-white/20">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-500/20 p-3 rounded-full mb-4 inline-block">
             <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-gradient">Bem-vindo de volta!</CardTitle>
          <CardDescription className="text-gray-400">Acesse sua conta para gerenciar suas finanças.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2"><AtSign className="w-4 h-4" />Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800/50 border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="flex items-center gap-2"><Lock className="w-4 h-4" />Senha</Label>
                <Link to="/forgot-password" className="text-xs text-blue-400 hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-800/50 border-gray-700"
              />
            </div>
            <Button type="submit" className="w-full gradient-bg font-bold" disabled={loading}>
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="text-gray-400">
            Não tem uma conta?{' '}
            <Link to="/signup" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default Login;