import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { planService } from '@/lib/services/planService';
import { Switch } from '@/components/ui/switch';
import { availableModules } from '@/lib/utils/modules';
import { Loader2 } from 'lucide-react';

const planSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  price: z.preprocess(
    (a) => parseFloat(String(a).replace(',', '.')),
    z.number().min(0, 'O preço não pode ser negativo')
  ),
  modules: z.object(
    availableModules.reduce((acc, module) => {
      acc[module.id] = z.boolean().optional();
      return acc;
    }, {})
  ).optional(),
});


const PlanFormDialog = ({ isOpen, onOpenChange, plan, onSuccess }) => {
  const { toast } = useToast();
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      price: 0,
      modules: availableModules.reduce((acc, module) => ({ ...acc, [module.id]: false }), {})
    }
  });

  useEffect(() => {
    if (isOpen) {
        if (plan) {
            const planModules = plan.modules || {};
            const initialModules = availableModules.reduce((acc, module) => {
                acc[module.id] = !!planModules[module.id];
                return acc;
            }, {});

            reset({
                name: plan.name,
                price: plan.price.toFixed(2).replace('.',','),
                modules: initialModules,
            });
        } else {
            const defaultModules = availableModules.reduce((acc, module) => {
                acc[module.id] = false;
                return acc;
            }, {});
            reset({
                name: '',
                price: '0,00',
                modules: defaultModules,
            });
        }
    }
  }, [plan, isOpen, reset]);
  
  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      modules: data.modules || {},
    };
    
    try {
      if (plan) {
        await planService.updatePlan(plan.id, formattedData);
      } else {
        await planService.createPlan(formattedData);
      }
      toast({
        title: 'Sucesso!',
        description: `Plano ${plan ? 'atualizado' : 'criado'} com sucesso.`,
        className: 'bg-emerald-500 text-white',
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao salvar plano',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect text-white border-slate-700/50 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-gradient">{plan ? 'Editar Plano' : 'Criar Novo Plano'}</DialogTitle>
          <DialogDescription className="text-gray-400">Defina os detalhes e os módulos incluídos no plano.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Plano</Label>
              <Input id="name" {...register('name')} placeholder="Ex: Básico, Pro" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço Mensal (R$)</Label>
              <Input id="price" type="text" {...register('price')} placeholder="Ex: 29,90" />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Módulos Incluídos</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 max-h-60 overflow-y-auto p-4 rounded-md border border-slate-700 bg-slate-900/50">
              {availableModules.map((module) => (
                <Controller
                  key={module.id}
                  name={`modules.${module.id}`}
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-3">
                      <Switch
                        id={module.id}
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-600"
                      />
                      <Label htmlFor={module.id} className="text-sm font-normal text-gray-300 cursor-pointer">
                        {module.label}
                      </Label>
                    </div>
                  )}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting} className="gradient-bg">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Salvando...' : 'Salvar Plano'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlanFormDialog;