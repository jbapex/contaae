import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send, Info } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { format, parseISO, isPast } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const DisparoCobrancaDialog = ({ open, onOpenChange, conta }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (conta) {
      setPhoneNumber(conta.cliente_telefone || '');
      
      const isAtrasado = conta.status === 'pendente' && isPast(new Date(conta.data_vencimento + 'T23:59:59'));
      const dataVencimentoFormatada = format(parseISO(conta.data_vencimento), 'dd/MM/yyyy');
      const valorParcelaFormatado = formatCurrency(conta.valor_parcela);

      let template = '';
      if (isAtrasado) {
        template = `Olá, ${conta.cliente_nome}. Notamos que sua parcela de ${valorParcelaFormatado}, que venceu em ${dataVencimentoFormatada}, está em atraso. Por favor, entre em contato para regularizar. Estamos à disposição para ajudar!`;
      } else {
        template = `Olá, ${conta.cliente_nome}! Passando para lembrar que sua parcela no valor de ${valorParcelaFormatado} vence no dia ${dataVencimentoFormatada}. Agradecemos a sua atenção!`;
      }
      setMessage(template);
    }
  }, [conta]);

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setPhoneNumber('');
      setMessage('');
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast({ title: "Número inválido", description: "O número de telefone é obrigatório.", variant: "destructive" });
      return;
    }
    if (!message.trim()) {
      toast({ title: "Mensagem vazia", description: "A mensagem não pode estar vazia.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          number: phoneNumber.replace(/\D/g, ''),
          message: message,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({ title: "Sucesso!", description: "Mensagem enviada com sucesso.", className: "bg-emerald-500 text-white" });
        handleOpenChange(false);
      } else {
        throw new Error(data.error || "Falha ao enviar a mensagem.");
      }
    } catch (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="glass-effect">
        <DialogHeader>
          <DialogTitle>Enviar Cobrança via WhatsApp</DialogTitle>
          <DialogDescription>
            Envie um lembrete de pagamento para {conta?.cliente_nome}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="telefone-cobranca">Número do Cliente</Label>
            <Input id="telefone-cobranca" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            {!phoneNumber && (
              <Alert variant="warning" className="mt-2">
                <Info className="h-4 w-4" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>
                  Este cliente não possui um número de telefone cadastrado.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <div>
            <Label htmlFor="mensagem-cobranca">Mensagem</Label>
            <Textarea id="mensagem-cobranca" value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[150px]" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting || !phoneNumber}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Enviar Mensagem
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DisparoCobrancaDialog;