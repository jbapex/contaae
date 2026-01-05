import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, KeyRound, Save, Loader2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { userService } from '@/lib/services/userService';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ProfileCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      if (user) {
        setEmail(user.email);
        try {
          const profile = await userService.getProfile();
          if (profile) {
            setNome(profile.nome || '');
            setWhatsapp(profile.whatsapp_number || '');
          }
        } catch (error) {
          toast({ title: "Erro", description: "Não foi possível carregar seu perfil.", variant: "destructive" });
        }
      }
      setLoadingProfile(false);
    };
    fetchProfile();
  }, [user, toast]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await userService.updateProfile({ nome, whatsapp_number: whatsapp });
      toast({ title: "Sucesso!", description: "Seu perfil foi atualizado." });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar seu perfil.", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveEmail = async () => {
    setSavingEmail(true);
    try {
      await userService.updateUserEmail(email);
      toast({ title: "Verifique seu e-mail!", description: "Enviamos um link de confirmação para o seu novo e antigo endereço de e-mail." });
    } catch (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSavePassword = async () => {
    if (password !== confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter no mínimo 6 caracteres.", variant: "destructive" });
      return;
    }
    setSavingPassword(true);
    try {
      await userService.updateUserPassword(password);
      toast({ title: "Sucesso!", description: "Sua senha foi alterada." });
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-cyan-400" />
            <span>Gerenciamento de Perfil</span>
          </CardTitle>
          <CardDescription>
            Atualize suas informações pessoais e de segurança.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loadingProfile ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <>
              {/* Profile Info */}
              <div className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="nome">Nome de Usuário</Label>
                  <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como você quer ser chamado?" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp para Disparos</Label>
                  <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="5511999999999" />
                </div>
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar Perfil
                </Button>
              </div>

              {/* Update Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Endereço de E-mail</Label>
                <div className="flex items-center space-x-2">
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <Button onClick={handleSaveEmail} disabled={savingEmail}>
                    {savingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">A alteração de e-mail requer confirmação em ambos os endereços.</p>
              </div>

              {/* Update Password */}
              <div className="space-y-4">
                <div>
                  <Label>Alterar Senha</Label>
                  <div className="space-y-2 mt-2">
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nova senha" />
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar nova senha" />
                  </div>
                </div>
                <Button onClick={handleSavePassword} disabled={savingPassword}>
                  {savingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
                  Salvar Nova Senha
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileCard;