import React, { useState, useEffect, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { Send, FileText, Loader2, Info } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Textarea } from '@/components/ui/textarea';
    import { useToast } from '@/components/ui/use-toast';
    import { lancamentoService } from '@/lib/services/lancamentoService';
    import { contasReceberService } from '@/lib/services/contasReceberService';
    import { clienteService } from '@/lib/services/clienteService';
    import { userService } from '@/lib/services/userService';
    import { calculations } from '@/lib/utils/calculations';
    import { supabase } from '@/lib/customSupabaseClient';
    import { DatePicker } from '@/components/ui/date-picker';
    import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

    const defaultMessageTemplate = `Olá, {nome_usuario}!

    Segue o resumo financeiro do período de {data_inicio} a {data_fim}:

    - Total de Entradas: {total_entradas}
    - Total de Saídas: {total_saidas}
    - Lucro/Prejuízo: {lucro}

    Qualquer dúvida, estamos à disposição.
    `;

    const DisparoManual = () => {
      const [phoneNumber, setPhoneNumber] = useState('');
      const [periodo, setPeriodo] = useState('7d');
      const [dataInicio, setDataInicio] = useState(null);
      const [dataFim, setDataFim] = useState(null);
      const [message, setMessage] = useState(defaultMessageTemplate);
      const [isSending, setIsSending] = useState(false);
      const { toast } = useToast();
      const [userName, setUserName] = useState('');
      const [userPhoneNumber, setUserPhoneNumber] = useState('');
      const [loadingProfile, setLoadingProfile] = useState(true);

      useEffect(() => {
        const fetchInitialData = async () => {
          setLoadingProfile(true);
          try {
            const profile = await userService.getProfile();
            setUserName(profile?.nome || 'Equipe JB Apex');
            setUserPhoneNumber(profile?.whatsapp_number || '');
            setPhoneNumber(profile?.whatsapp_number || '');
          } catch (error) {
            toast({ title: "Erro", description: "Não foi possível carregar seu perfil.", variant: "destructive" });
          } finally {
            setLoadingProfile(false);
          }
        };
        fetchInitialData();
      }, [toast]);

      const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
      const formatDate = (date) => new Date(date).toLocaleDateString('pt-BR');

      const generateReport = useCallback(async () => {
        let startDate, endDate = new Date();
        switch (periodo) {
          case '7d':
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 7);
            break;
          case '15d':
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 15);
            break;
          case '30d':
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 30);
            break;
          case 'custom':
            if (!dataInicio || !dataFim) {
              toast({ title: "Atenção", description: "Selecione as datas de início e fim.", variant: "destructive" });
              return null;
            }
            startDate = dataInicio;
            endDate = dataFim;
            break;
          default:
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 7);
        }

        const allLancamentos = await lancamentoService.getLancamentos();
        const lancamentosPeriodo = allLancamentos.filter(l => {
          const dataLancamento = new Date(l.data);
          return dataLancamento >= startDate && dataLancamento <= endDate;
        });

        const { entradas, saidas, lucro, despesasFixas, despesasVariaveis, lucroLiquido } = calculations.getResultsForLancamentos(lancamentosPeriodo);
        
        const allContasReceber = await contasReceberService.getContasReceber();
        const parcelasAbertas = allContasReceber.filter(p => p.status !== 'pago');
        const totalParcelasAberto = parcelasAbertas.reduce((acc, p) => acc + p.valor_parcela, 0);
        const totalParcelasVencidas = parcelasAbertas.filter(p => new Date(p.data_vencimento) < new Date() && p.status === 'pendente').reduce((acc, p) => acc + p.valor_parcela, 0);

        const clientes = await clienteService.getClientes();
        const totalClientesAtivos = clientes.filter(c => c.status === 'Ativo').length;

        return {
          data_inicio: formatDate(startDate),
          data_fim: formatDate(endDate),
          total_entradas: formatCurrency(entradas),
          total_saidas: formatCurrency(saidas),
          lucro: formatCurrency(lucro),
          nome_usuario: userName,
          total_despesas_fixas: formatCurrency(despesasFixas),
          total_despesas_variaveis: formatCurrency(despesasVariaveis),
          lucro_liquido: formatCurrency(lucroLiquido),
          total_parcelas_aberto: formatCurrency(totalParcelasAberto),
          total_parcelas_vencidas: formatCurrency(totalParcelasVencidas),
          total_clientes_ativos: totalClientesAtivos,
        };
      }, [periodo, dataInicio, dataFim, toast, userName]);

      const handleSendMessage = async () => {
        if (!phoneNumber) {
          toast({ title: "Erro", description: "Por favor, insira um número de telefone.", variant: "destructive" });
          return;
        }

        setIsSending(true);
        try {
          const reportData = await generateReport();
          if (!reportData) {
            setIsSending(false);
            return;
          }

          let finalMessage = message;
          for (const key in reportData) {
            finalMessage = finalMessage.replace(new RegExp(`{${key}}`, 'g'), reportData[key]);
          }

          const { data, error } = await supabase.functions.invoke('send-whatsapp', {
            body: {
              number: phoneNumber.replace(/\D/g, ''),
              message: finalMessage,
            },
          });

          if (error) throw error;

          if (data.success) {
            toast({ title: "Sucesso!", description: "Mensagem enviada com sucesso." });
          } else {
            throw new Error(data.error || "Falha ao enviar a mensagem.");
          }

        } catch (error) {
          toast({
            title: "Erro ao enviar mensagem",
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setIsSending(false);
        }
      };

      const insertVariable = (variable) => {
        setMessage(prev => `${prev}{${variable}}`);
      };

      const variables = [
        'nome_usuario', 'data_inicio', 'data_fim', 'total_entradas', 'total_saidas', 'lucro',
        'total_despesas_fixas', 'total_despesas_variaveis', 'lucro_liquido',
        'total_parcelas_aberto', 'total_parcelas_vencidas', 'total_clientes_ativos'
      ];

      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div className="lg:col-span-2 space-y-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>1. Configurar Relatório</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Período do Relatório</Label>
                  <Select value={periodo} onValueChange={setPeriodo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Últimos 7 dias</SelectItem>
                      <SelectItem value="15d">Últimos 15 dias</SelectItem>
                      <SelectItem value="30d">Últimos 30 dias</SelectItem>
                      <SelectItem value="custom">Período customizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {periodo === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Data de Início</Label>
                      <DatePicker date={dataInicio} setDate={setDataInicio} />
                    </div>
                    <div>
                      <Label>Data de Fim</Label>
                      <DatePicker date={dataFim} setDate={setDataFim} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>2. Montar Mensagem</CardTitle>
                <CardDescription>Use as variáveis para personalizar a mensagem. Elas serão substituídas pelos dados do relatório.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Digite sua mensagem aqui..."
                  className="min-h-[200px] text-base"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
                <div className="mt-4">
                  <Label>Variáveis disponíveis:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {variables.map(v => (
                      <Button key={v} variant="outline" size="sm" onClick={() => insertVariable(v)}>
                        {`{${v}}`}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div className="lg:col-span-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-effect sticky top-24">
              <CardHeader>
                <CardTitle>3. Enviar Mensagem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {loadingProfile ? (
                   <div className="flex justify-center items-center h-10">
                     <Loader2 className="w-5 h-5 animate-spin" />
                   </div>
                 ) : (
                   <div>
                     <Label htmlFor="phone">Número do WhatsApp (com DDI e DDD)</Label>
                     <Input id="phone" placeholder="Ex: 5511999999999" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                     {!userPhoneNumber && (
                       <Alert variant="destructive" className="mt-4">
                         <Info className="h-4 w-4" />
                         <AlertTitle>Ação Necessária</AlertTitle>
                         <AlertDescription>
                           Você ainda não cadastrou um número de WhatsApp para disparos em seu perfil nas Configurações.
                         </AlertDescription>
                       </Alert>
                     )}
                   </div>
                 )}
                <Button
                  className="w-full gradient-bg text-lg py-6"
                  onClick={handleSendMessage}
                  disabled={isSending || !phoneNumber || loadingProfile}
                >
                  {isSending ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-5 w-5" />
                  )}
                  {isSending ? 'Enviando...' : 'Enviar Agora'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    };

    export default DisparoManual;