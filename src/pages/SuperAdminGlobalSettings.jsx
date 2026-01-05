import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { globalSettingsService } from '@/lib/services/globalSettingsService';
import { Globe, Key, Save, Loader2 } from 'lucide-react';

const SuperAdminGlobalSettings = () => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchApiKey = async () => {
      setIsLoading(true);
      try {
        const key = await globalSettingsService.getGlobalSettings('openai_api_key');
        if (key) {
          setApiKey(key);
        }
      } catch (error) {
        toast({
          title: "Erro ao buscar chave de API",
          description: "Não foi possível carregar a chave de API global.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchApiKey();
  }, [toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await globalSettingsService.saveGlobalSettings('openai_api_key', apiKey);
      toast({
        title: "Configuração salva!",
        description: "A chave de API da OpenAI foi atualizada para todo o sistema.",
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
        <h1 className="text-3xl font-bold text-gradient">Configurações Globais</h1>
        <p className="text-gray-400">Ajustes que afetam toda a plataforma.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-effect border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span>Configurações da Inteligência Artificial (LLM)</span>
            </CardTitle>
            <CardDescription>
              Esta chave de API da OpenAI será usada por todos os usuários da plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {isLoading ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="apiKey" className="flex items-center space-x-2 mb-2">
                    <Key className="w-4 h-4" />
                    <span>Chave de API Global (OpenAI)</span>
                  </Label>
                  <Input
                    id="apiKey"
                    name="apiKey"
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-gray-400 mt-2">Sua chave é armazenada de forma segura e nunca exposta no navegador.</p>
                </div>
                <Button onClick={handleSave} className="gradient-bg" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isSaving ? 'Salvando...' : 'Salvar Chave de API'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SuperAdminGlobalSettings;