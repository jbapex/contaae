import React, { useState, useEffect } from 'react';
import { Settings, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { iaService } from '@/lib/services/iaService';

const ConfiguracaoIA = () => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchApiKey = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const key = await iaService.getOpenAiApiKey(user.id);
        if (key) {
          setApiKey(key);
        }
      } catch (error) {
        toast({ title: "Erro ao buscar chave", description: "Não foi possível carregar sua chave de API.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchApiKey();
  }, [user, toast]);

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await iaService.saveOpenAiApiKey(user.id, apiKey);
      toast({ title: "Configuração salva!", description: "Sua chave de API foi salva com segurança." });
    } catch (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-blue-400" />
          <span>Configuração da IA</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="apiKey" className="flex items-center space-x-2 mb-2">
            <Key className="w-4 h-4" />
            <span>Chave de API (OpenAI)</span>
          </Label>
          <Input
            id="apiKey"
            name="apiKey"
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isLoading}
          />
           <p className="text-xs text-gray-400 mt-2">Sua chave é armazenada de forma segura e nunca exposta no navegador.</p>
        </div>
        <Button onClick={handleSave} className="w-full gradient-bg" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Chave de API'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConfiguracaoIA;