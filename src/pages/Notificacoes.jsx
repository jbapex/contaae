import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Loader2, BarChart, Calendar, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { clienteService } from '@/lib/services/clienteService';
import { lancamentoService } from '@/lib/services/lancamentoService';
import { settingsService } from '@/lib/services/settingsService';
import { calculations } from '@/lib/utils/calculations';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const Notificacoes = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [periodo, setPeriodo] = useState('currentMonth');
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, settingsData] = await Promise.all([
          clienteService.getClientes(),
          settingsService.getSettings()
        ]);
        setClientes(clientsData);
        setSettings(settingsData);
      } catch (error) {
        toast({
          title: "Erro ao carregar dados",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleSendNotification = async () => {
    if (!selectedCliente) {
      toast({ title: "Selecione um cliente", variant: "destructive" });
      return;
    }
    if (!settings?.whatsapp_webhook_url) {
      toast({
        title: "Webhook não configurado",
        description: "Por favor, configure a URL do webhook de WhatsApp nas Configurações.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const allLancamentos = await lancamentoService.getLancamentos();
      
      const now = new Date();
      let startDate, endDate;
      let periodoNome = '';

      switch (periodo) {
        case 'currentMonth':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          periodoNome = `Mês de ${format(now, 'MMMM')}`;
          break;
        case 'lastMonth':
          const lastMonthDate = subMonths(now, 1);
          startDate = startOfMonth(lastMonthDate);
          endDate = endOfMonth(lastMonthDate);
          periodoNome = `Mês de ${format(lastMonthDate, 'MMMM')}`;
          break;
        default:
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          periodoNome = `Mês de ${format(now, 'MMMM')}`;
      }

      const clienteLancamentos = allLancamentos.filter(l => {
        const dataLancamento = new Date(l.data);
        return l.cliente?.id === selectedCliente && dataLancamento >= startDate && dataLancamento <= endDate;
      });

      const { entradas, saidas, lucro } = calculations.getClientResults(clienteLancamentos, selectedCliente);

      const clienteInfo = clientes.find(c => c.id === selectedCliente);

      const message = `Olá, ${clienteInfo.nome}! Segue o resumo financeiro para o período: *${periodoNome}*.\n\n*Entradas:* R$ ${entradas.toFixed(2)}\n*Saídas:* R$ ${saidas.toFixed(2)}\n*Resultado:* R$ ${lucro.toFixed(2)}\n\nQualquer dúvida, estamos à disposição!`;

      const response = await fetch(settings.whatsapp_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar a notificação via webhook.');
      }

      toast({
        title: "Notificação enviada!",
        description: `Relatório para ${clienteInfo.nome} enviado com sucesso.`,
        className: "bg-emerald-500 text-white",
      });

    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      toast({
        title: "Erro ao enviar",
        description: error.message || "Não foi possível enviar a notificação.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-3"
      >
        <Bell className="w-10 h-10 text-fuchsia-400" />
        <div>
          <h1 className="text-3xl font-bold text-gradient">Notificações</h1>
          <p className="text-gray-400">Envie relatórios e avisos para seus clientes via WhatsApp.</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-effect max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Enviar Relatório Financeiro</CardTitle>
            <CardDescription>Selecione o cliente e o período para enviar um resumo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <User className="w-4 h-4" />
                <span>Cliente</span>
              </label>
              {loading ? (
                <div className="flex items-center justify-center h-10"><Loader2 className="w-5 h-5 animate-spin" /></div>
              ) : (
                <Select onValueChange={setSelectedCliente} value={selectedCliente}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map(cliente => (
                      <SelectItem key={cliente.id} value={cliente.id}>{cliente.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>Período</span>
              </label>
              <Select onValueChange={setPeriodo} value={periodo}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o período..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="currentMonth">Mês Atual</SelectItem>
                  <SelectItem value="lastMonth">Mês Passado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSendNotification} disabled={isSending || loading || !selectedCliente} className="w-full gradient-bg">
              {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Enviar Notificação
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Notificacoes;