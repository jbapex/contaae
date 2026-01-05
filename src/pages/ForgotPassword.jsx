import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ForgotPassword = () => {
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await sendPasswordResetEmail(email);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.",
        variant: "destructive",
      });
    } else {
      setSent(true);
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
          <div className="mx-auto bg-yellow-500/20 p-3 rounded-full mb-4 inline-block">
             <KeyRound className="w-8 h-8 text-yellow-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-gradient">Recuperar Senha</CardTitle>
          <CardDescription className="text-gray-400">
            {sent 
              ? "Verifique sua caixa de entrada!" 
              : "Insira seu e-mail para receber o link de recuperação."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <p>Um e-mail com instruções para redefinir sua senha foi enviado para <span className="font-bold text-yellow-400">{email}</span>.</p>
              <p className="text-sm text-gray-400">Se não o encontrar, verifique sua pasta de spam.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4" />Email</Label>
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
              <Button type="submit" className="w-full gradient-bg font-bold" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="text-center text-sm">
          <Link to="/login" className="flex items-center gap-2 font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Login
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ForgotPassword;