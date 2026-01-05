import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, LogIn } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SUPER_ADMIN_CODE = "Ajc7josi";

const SuperAdminLogin = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (code === SUPER_ADMIN_CODE) {
      sessionStorage.setItem('superAdminAuthenticated', 'true');
      toast({
        title: "Acesso Concedido!",
        description: "Bem-vindo ao Painel Super Administrador.",
        className: "bg-green-500 text-white",
      });
      navigate('/super-admin');
    } else {
      toast({
        title: "Acesso Negado",
        description: "O código inserido está incorreto.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md glass-effect border-white/20 text-white">
          <CardHeader className="text-center">
            <div className="mx-auto bg-gradient-to-r from-emerald-500 to-cyan-500 p-3 rounded-full w-fit mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gradient">Acesso Super Admin</CardTitle>
            <CardDescription className="text-gray-400">
              Insira o código de acesso para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  id="access-code"
                  type="password"
                  placeholder="Código Secreto"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                />
              </div>
              <Button type="submit" className="w-full gradient-bg" disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SuperAdminLogin;