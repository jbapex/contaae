import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { globalSettingsService } from '@/lib/services/globalSettingsService';
import { Zap, Key, Save, Loader2, MessageSquare } from 'lucide-react';

const SuperAdminIntegrations = () => {
  const [wuzapiToken, setWuzapiToken] = useState('');
  const [wuzapiAtivo, setWuzapiAtivo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const token = await globalSettingsService.getGlobalSettings('wuzapi_token');
        const ativo = await globalSettingsService.getGlobalSettings('wuzapi_ativo');
        setWuzapiToken(token || '');
        setWuzapiAtivo(ativo === 'true');
      } catch (error) {
        toast({
          title: "Erro ao buscar configurações",
          description: "Não foi possível carregar as configurações de integração.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await globalSettingsService.saveGlobalSettings('wuzapi_token', wuzapiToken);
      await globalSettingsService.saveGlobalSettings('wuzapi_ativo', wuzapiAtivo.toString());
      toast({
        title: "Configurações salvas!",
        description: "As configurações de integração com WhatsApp foram atualizadas.",
        className: 'bg-emerald-500 text-white'
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Integrações</h1>
        <p className="text-gray-400">Conecte a plataforma com serviços externos.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-effect border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-green-400" />
              <span>Integração com WhatsApp (Wuzapi)</span>
            </CardTitle>
            <CardDescription>
              Configure o token da API para permitir o envio de mensagens e notificações via WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-green-400" />
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="wuzapi-active"
                    checked={wuzapiAtivo}
                    onCheckedChange={setWuzapiAtivo}
                    disabled={isSaving}
                  />
                  <Label htmlFor="wuzapi-active">Ativar integração com Wuzapi</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wuzapiToken" className="flex items-center space-x-2">
                    <Key className="w-4 h-4" />
                    <span>Token da API (Wuzapi)</span>
                  </Label>
                  <Input
                    id="wuzapiToken"
                    name="wuzapiToken"
                    type="password"
                    placeholder="Seu token da Wuzapi"
                    value={wuzapiToken}
                    onChange={(e) => setWuzapiToken(e.target.value)}
                    disabled={isSaving || !wuzapiAtivo}
                  />
                  <p className="text-xs text-gray-400">Seu token é armazenado de forma segura.</p>
                </div>
                <Button onClick={handleSave} className="gradient-bg" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SuperAdminIntegrations;