import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { settingsService } from '@/lib/services/settingsService';

const IntegrationsCard = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const settings = await settingsService.getSettings();
        if (settings) {
          setWebhookUrl(settings.whatsapp_webhook_url || '');
        }
      } catch (error) {
         toast({
          title: "Erro ao carregar configurações",
          description: "Não foi possível buscar as configurações de integração.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsService.saveSettings({ whatsapp_webhook_url: webhookUrl });
      toast({
        title: "Configurações salvas!",
        description: "Sua URL de webhook do WhatsApp foi atualizada.",
        className: "bg-emerald-500 text-white",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a URL do webhook.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span>Integrações</span>
          </CardTitle>
          <CardDescription>
            Conecte o sistema a outros serviços.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="whatsapp-webhook" className="text-gray-300">Webhook do WhatsApp</Label>
            <p className="text-xs text-gray-500 mb-2">
              Use serviços como Zapier ou Make.com para enviar notificações.
            </p>
            {loading ? (
              <div className="flex items-center justify-center h-10">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              <Input
                id="whatsapp-webhook"
                type="url"
                placeholder="https://hooks.zapier.com/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="bg-slate-800/50 border-slate-700"
              />
            )}
          </div>
          <Button onClick={handleSave} disabled={isSaving || loading} size="sm">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default IntegrationsCard;