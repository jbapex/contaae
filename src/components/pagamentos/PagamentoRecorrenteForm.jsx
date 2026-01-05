import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { fornecedorService } from '@/lib/services/fornecedorService';
import { categoriaService } from '@/lib/services/categoriaService';
import { pagamentoRecorrenteSchema } from '@/lib/schemas/pagamentoRecorrenteSchema';

const diasDaSemana = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

const PagamentoRecorrenteForm = ({ open, setOpen, pagamento, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [fornecedores, setFornecedores] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(pagamentoRecorrenteSchema),
    defaultValues: {
      nome: '',
      valor: '',
      frequencia: 'mensal',
      dia_vencimento: 1,
      ativo: true,
      categoria_id: '',
      fornecedor_id: null,
    }
  });

  const frequencia = watch('frequencia');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fornecedoresData, categoriasData] = await Promise.all([
          fornecedorService.getFornecedores(),
          categoriaService.getCategorias()
        ]);
        setFornecedores(fornecedoresData);
        setCategorias(categoriasData.saidas);
      } catch (error) {
        console.error("Erro ao carregar dados para o formulário:", error);
      }
    };
    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (pagamento) {
      reset({
        id: pagamento.id,
        nome: pagamento.nome,
        valor: String(pagamento.valor),
        frequencia: pagamento.frequencia,
        dia_vencimento: String(pagamento.dia_vencimento),
        ativo: pagamento.ativo,
        categoria_id: pagamento.categoria_nome,
        fornecedor_id: pagamento.fornecedor_id,
      });
    } else {
      reset({
        id: null,
        nome: '',
        valor: '',
        frequencia: 'mensal',
        dia_vencimento: '1',
        ativo: true,
        categoria_id: '',
        fornecedor_id: null,
      });
    }
  }, [pagamento, reset, open]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const categoriaId = await categoriaService.findCategoriaId(data.categoria_id, 'saida', true);
      if (!categoriaId) {
        throw new Error("Não foi possível encontrar ou criar a categoria.");
      }
      
      const payload = {
        ...data,
        valor: parseFloat(data.valor),
        dia_vencimento: parseInt(data.dia_vencimento, 10),
        categoria_id: categoriaId,
      };
      await onSave(payload);
      setOpen(false);
    } catch (error) {
      console.error("Erro ao salvar pagamento:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{pagamento ? 'Editar' : 'Novo'} Pagamento Recorrente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" {...register('nome')} placeholder="Ex: Aluguel do Escritório" />
            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
          </div>
          <div>
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input id="valor" type="number" step="0.01" {...register('valor')} placeholder="1500.00" />
            {errors.valor && <p className="text-red-500 text-xs mt-1">{errors.valor.message}</p>}
          </div>
          <div>
            <Label>Categoria</Label>
            <Select onValueChange={(value) => setValue('categoria_id', value, { shouldValidate: true })} value={watch('categoria_id') || ''}>
              <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
              <SelectContent>{categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            {errors.categoria_id && <p className="text-red-500 text-xs mt-1">{errors.categoria_id.message}</p>}
          </div>
          <div>
            <Label>Fornecedor (Opcional)</Label>
            <Select onValueChange={(value) => setValue('fornecedor_id', value)} value={watch('fornecedor_id') || ''}>
              <SelectTrigger><SelectValue placeholder="Selecione um fornecedor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Nenhum</SelectItem>
                {fornecedores.map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Frequência</Label>
            <Select onValueChange={(value) => setValue('frequencia', value)} value={frequencia}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dia_vencimento">
              {frequencia === 'mensal' ? 'Dia do Vencimento' : 'Dia da Semana'}
            </Label>
            {frequencia === 'mensal' ? (
              <Input id="dia_vencimento" type="number" {...register('dia_vencimento')} placeholder="1-31" />
            ) : (
              <Select onValueChange={(value) => setValue('dia_vencimento', value)} value={String(watch('dia_vencimento'))}>
                <SelectTrigger><SelectValue placeholder="Selecione o dia" /></SelectTrigger>
                <SelectContent>
                  {diasDaSemana.map(dia => <SelectItem key={dia.value} value={String(dia.value)}>{dia.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            {errors.dia_vencimento && <p className="text-red-500 text-xs mt-1">{errors.dia_vencimento.message}</p>}
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="ativo" checked={watch('ativo')} onCheckedChange={(checked) => setValue('ativo', checked)} />
            <Label htmlFor="ativo">Ativo</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PagamentoRecorrenteForm;