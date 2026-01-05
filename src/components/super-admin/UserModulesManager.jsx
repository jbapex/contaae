import React, { useState, useEffect, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { settingsService } from '@/lib/services/settingsService';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Package, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { availableModules } from '@/lib/utils/modules';
import { superAdminService } from '@/lib/services/superAdminService';
import { planService } from '@/lib/services/planService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UserModulesManager = ({ user, onModulesUpdate }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingStates, setSavingStates] = useState({});
  const [moduleSource, setModuleSource] = useState('plan');
  const [planModules, setPlanModules] = useState({});
  const { toast } = useToast();

  const fetchInitialData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [currentSettings, userMetadata, planData] = await Promise.all([
        settingsService.getSettings(user.id),
        superAdminService.getUserMetadata(user.id),
        user.plan_id ? planService.getPlanById(user.plan_id) : Promise.resolve(null)
      ]);

      const initializedSettings = availableModules.reduce((acc, module) => {
        acc[module.id] = currentSettings?.[module.id] ?? false;
        return acc;
      }, {});
      setSettings(initializedSettings);
      
      setModuleSource(userMetadata?.module_source || 'plan');
      
      if (planData) {
        setPlanModules(planData.modules || {});
      }

    } catch (error) {
      toast({ title: "Erro ao carregar dados do usuário", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);
  
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleModuleSourceChange = async (newSource) => {
    setLoading(true);
    setModuleSource(newSource);
    try {
      await superAdminService.updateUserMetadata(user.id, { module_source: newSource });
      toast({
        title: "Fonte dos módulos atualizada!",
        description: `Agora os módulos são gerenciados pelo modo: ${newSource === 'plan' ? 'Plano' : 'Personalizado'}.`,
        className: "bg-sky-500 text-white"
      });
      if (newSource === 'plan' && user.plan_id) {
        await settingsService.syncWithPlan(user.id, user.plan_id);
      }
      await fetchInitialData();
       if(onModulesUpdate) {
        onModulesUpdate();
      }
    } catch (error) {
      toast({ title: "Erro ao atualizar fonte", description: error.message, variant: "destructive" });
      setModuleSource(newSource === 'plan' ? 'custom' : 'plan');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = async (moduleId, value) => {
    if (moduleSource === 'plan') return;

    setSavingStates(prev => ({ ...prev, [moduleId]: true }));
    
    const oldSettings = { ...settings };
    const newSettings = { ...settings, [moduleId]: value };
    setSettings(newSettings);

    try {
      await settingsService.saveSettings(newSettings, user.id);
      toast({
        title: "Módulo atualizado!",
        description: `O módulo para ${user.email} foi ${value ? 'ativado' : 'desativado'}.`,
        className: "bg-emerald-500 text-white"
      });
      if(onModulesUpdate) {
        onModulesUpdate();
      }
    } catch (error) {
      setSettings(oldSettings);
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setSavingStates(prev => ({ ...prev, [moduleId]: false }));
    }
  };

  const ModuleToggle = ({ module, disabled }) => {
    const Icon = module.icon;
    const isSaving = savingStates[module.id];
    const isChecked = disabled ? (planModules[module.id] ?? false) : (settings[module.id] ?? false);
    
    return (
      <div className={`flex items-center justify-between p-4 rounded-lg bg-slate-800/50 ${disabled ? 'opacity-60' : ''}`}>
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5 text-cyan-400" />
          <Label htmlFor={`${module.id}-${user.id}-switch`} className={`text-base font-medium ${disabled ? 'cursor-not-allowed' : ''}`}>
            {module.label}
          </Label>
        </div>
        {isSaving ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Switch
            id={`${module.id}-${user.id}-switch`}
            checked={isChecked}
            onCheckedChange={(value) => handleToggleChange(module.id, value)}
            disabled={disabled}
            className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-600"
          />
        )}
      </div>
    );
  };

  return (
      <Card className="glass-effect mt-4 border-none shadow-none">
        <CardHeader>
          <CardTitle>Módulos para {user.email}</CardTitle>
          <CardDescription>Defina como os módulos do usuário serão gerenciados.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Fonte dos Módulos</Label>
                <Tabs value={moduleSource} onValueChange={handleModuleSourceChange} className="w-full mt-2">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="plan"><Package className="w-4 h-4 mr-2" /> Plano</TabsTrigger>
                    <TabsTrigger value="custom"><SlidersHorizontal className="w-4 h-4 mr-2" /> Personalizado</TabsTrigger>
                  </TabsList>
                  <TabsContent value="plan" className="mt-4 text-sm text-gray-400">
                    Os módulos são definidos pelo plano <span className="font-bold text-white">{user.plan_name || 'N/A'}</span>. Para alterar, mude o plano do usuário ou mude a fonte para "Personalizado".
                  </TabsContent>
                  <TabsContent value="custom" className="mt-4 text-sm text-gray-400">
                    Você pode ativar ou desativar módulos individualmente para este usuário. Essas configurações sobrescrevem o plano.
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-4">
                {availableModules.map(module => (
                  <ModuleToggle key={module.id} module={module} disabled={moduleSource === 'plan'} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
  );
};

export default UserModulesManager;