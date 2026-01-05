import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { relatorioAgendadoService } from '@/lib/services/relatorioAgendadoService';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  frequencia: z.enum(['diario', 'semanal', 'mensal']),
  dia_semana: z.string().optional(),
  horario_envio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)."),
  periodo_dados: z.coerce.number().int().min(0, "O período não pode ser negativo."),
}).refine(data => {
    if (data.frequencia === 'semanal' && !data.dia_semana) return false;
    if (data.frequencia === 'mensal' && (!data.dia_semana || isNaN(parseInt(data.dia_semana)) || parseInt(data.dia_semana) < 1 || parseInt(data.dia_semana) > 31)) return false;
    return true;
}, {
    message: "Dia da semana/mês é obrigatório para a frequência selecionada.",
    path: ["dia_semana"],
});

const RelatorioAgendadoForm = ({ isOpen, onClose, onSuccess, relatorio }) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      frequencia: 'diario',
      dia_semana: '',
      horario_envio: '09:00',
      periodo_dados: 7,
    }
  });

  const frequencia = watch('frequencia');

  useEffect(() => {
    if (relatorio) {
      reset({
        ...relatorio,
        horario_envio: relatorio.horario_envio.substring(0, 5)
      });
    } else {
      reset({
        nome: '',
        frequencia: 'diario',
        dia_semana: '',
        horario_envio: '09:00',
        periodo_dados: 7,
      });
    }
  }, [relatorio, reset]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const payload = { ...data };
      if (relatorio) {
        payload.id = relatorio.id;
      }
      if (data.frequencia === 'diario') {
        payload.dia_semana = null;
      }
      
      await relatorioAgendadoService.saveRelatorioAgendado(payload);
      toast({ title: "Sucesso!", description: `Relatório "${data.nome}" salvo com sucesso.` });
      onSuccess();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível salvar o relatório.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] glass-effect">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gradient">{relatorio ? 'Editar' : 'Criar'} Relatório Agendado</DialogTitle>
          <DialogDescription>
            Configure os detalhes para o envio automático do seu relatório financeiro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="nome">Nome do Relatório</Label>
            <Input id="nome" {...register("nome")} />
            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Frequência</Label>
              <Select onValueChange={(value) => setValue('frequencia', value)} value={frequencia}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diário</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {frequencia === 'semanal' && (
              <div>
                <Label>Dia da Semana</Label>
                <Select onValueChange={(value) => setValue('dia_semana', value)} value={watch('dia_semana')}>
                  <SelectTrigger><SelectValue placeholder="Selecione o dia" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="segunda">Segunda-feira</SelectItem>
                    <SelectItem value="terca">Terça-feira</SelectItem>
                    <SelectItem value="quarta">Quarta-feira</SelectItem>
                    <SelectItem value="quinta">Quinta-feira</SelectItem>
                    <SelectItem value="sexta">Sexta-feira</SelectItem>
                  </SelectContent>
                </Select>
                {errors.dia_semana && <p className="text-red-500 text-xs mt-1">{errors.dia_semana.message}</p>}
              </div>
            )}
            {frequencia === 'mensal' && (
              <div>
                <Label>Dia do Mês</Label>
                <Input type="number" min="1" max="31" {...register("dia_semana")} />
                {errors.dia_semana && <p className="text-red-500 text-xs mt-1">{errors.dia_semana.message}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="horario_envio">Horário do Envio</Label>
              <Input id="horario_envio" type="time" {...register("horario_envio")} />
              {errors.horario_envio && <p className="text-red-500 text-xs mt-1">{errors.horario_envio.message}</p>}
            </div>
            <div>
              <Label htmlFor="periodo_dados">Período dos Dados (dias)</Label>
              <Input id="periodo_dados" type="number" {...register("periodo_dados")} />
              <p className="text-xs text-gray-500 mt-1">0 = Dia atual</p>
              {errors.periodo_dados && <p className="text-red-500 text-xs mt-1">{errors.periodo_dados.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Disparo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RelatorioAgendadoForm;