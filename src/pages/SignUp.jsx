import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, AtSign, Lock, Sparkles, Package } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { planService } from '@/lib/services/planService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SignUp = () => {
  const { signUp } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [planId, setPlanId] = useState(undefined);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const availablePlans = await planService.getAllPlans();
        setPlans(availablePlans);
      } catch (error) {
        toast({
          title: "Erro ao carregar planos",
          description: "Não foi possível buscar os planos disponíveis.",
          variant: "destructive",
        });
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!planId) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione um plano.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);

    const { error } = await signUp(email, password, { data: { nome, plan_id: planId } });
    
    if (error) {
       toast({
        title: "Erro no Cadastro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Enviamos um link de confirmação para o seu e-mail.",
      });
      navigate('/login');
    }

    setLoading(false);
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
          <div className="mx-auto bg-fuchsia-500/20 p-3 rounded-full mb-4 inline-block">
             <Sparkles className="w-8 h-8 text-fuchsia-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-gradient">Crie sua Conta</CardTitle>
          <CardDescription className="text-gray-400">Comece a organizar suas finanças hoje mesmo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="flex items-center gap-2"><User className="w-4 h-4" />Seu Nome</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="bg-gray-800/50 border-gray-700"
              />
            </div>
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
              <Label htmlFor="password" className="flex items-center gap-2"><Lock className="w-4 h-4" />Senha</Label>
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

            <div className="space-y-2">
              <Label htmlFor="plan" className="flex items-center gap-2"><Package className="w-4 h-4" />Plano</Label>
              <Select onValueChange={setPlanId} value={planId} disabled={loadingPlans}>
                <SelectTrigger className="w-full bg-gray-800/50 border-gray-700">
                  <SelectValue placeholder={loadingPlans ? "Carregando planos..." : "Selecione um plano"} />
                </SelectTrigger>
                <SelectContent className="glass-effect-dark">
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - R$ {plan.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full gradient-bg font-bold" disabled={loading || loadingPlans}>
              <User className="mr-2 h-4 w-4" />
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="text-gray-400">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Faça Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default SignUp;