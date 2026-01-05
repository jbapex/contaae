import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Upload, Check, X, Search, Loader2, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { conciliacaoService } from '@/lib/services/conciliacaoService';
import Papa from 'papaparse';
import { format, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { contaBancariaService } from '@/lib/services/contaBancariaService';
import MapeamentoColunasDialog from '@/components/conciliacao/MapeamentoColunasDialog';

const formatCurrency = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const ConciliacaoBancaria = () => {
    const [extratoTransacoes, setExtratoTransacoes] = useState([]);
    const [sugestoes, setSugestoes] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [selectedTransacao, setSelectedTransacao] = useState(null);
    const [lancamentos, setLancamentos] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [contasBancarias, setContasBancarias] = useState([]);
    const [selectedConta, setSelectedConta] = useState('');
    const [isMappingOpen, setIsMappingOpen] = useState(false);
    const [csvData, setCsvData] = useState({ headers: [], data: [] });

    const { toast } = useToast();
    const fileInputRef = useRef(null);

    const loadContasBancarias = async () => {
        try {
            const data = await contaBancariaService.getContasBancarias();
            setContasBancarias(data);
            if(data.length > 0) {
                setSelectedConta(data[0].id);
            }
        } catch (error) {
            toast({ title: 'Erro', description: 'Falha ao carregar contas bancárias.', variant: 'destructive' });
        }
    };

    const loadTransacoesPendentes = useCallback(async () => {
        if (!selectedConta) return;
        setLoading(true);
        try {
            const data = await conciliacaoService.getTransacoesExtratoPendentes(selectedConta);
            setExtratoTransacoes(data);
            if (data.length > 0) {
                fetchSuggestionsForTransacoes(data);
            } else {
                setSugestoes({});
            }
        } catch (error) {
            toast({ title: 'Erro', description: 'Falha ao carregar transações pendentes.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [selectedConta, toast]);

    const fetchSuggestionsForTransacoes = async (transacoes) => {
        setLoadingSuggestions(true);
        try {
            const allSugestoes = await conciliacaoService.getSugestoesConciliacao(transacoes);
            const sugsMap = allSugestoes.reduce((acc, current) => {
                acc[current.transacao_id] = current.sugestoes;
                return acc;
            }, {});
            setSugestoes(sugsMap);
        } catch (error) {
            toast({ title: 'Erro', description: 'Falha ao buscar sugestões de conciliação.', variant: 'destructive' });
        } finally {
            setLoadingSuggestions(false);
        }
    }

    useEffect(() => {
        loadContasBancarias();
    }, []);
    
    useEffect(() => {
        loadTransacoesPendentes();
    }, [loadTransacoesPendentes]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && selectedConta) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.data && results.meta.fields) {
                        setCsvData({ headers: results.meta.fields, data: results.data });
                        setIsMappingOpen(true);
                    } else {
                        toast({ title: 'Erro no Arquivo', description: 'Não foi possível processar o arquivo CSV. Verifique o formato.', variant: 'destructive' });
                    }
                },
                error: (error) => {
                    toast({ title: 'Erro no Parsing', description: `Não foi possível ler o arquivo CSV: ${error.message}`, variant: 'destructive' });
                }
            });
        } else if (!selectedConta) {
             toast({ title: 'Atenção', description: 'Por favor, selecione uma conta bancária antes de importar.', variant: 'default' });
        }
        if(fileInputRef.current) fileInputRef.current.value = "";
    };
    
    const handleMappingConfirm = async (mapping) => {
        try {
            await conciliacaoService.uploadExtrato(csvData.data, mapping, selectedConta);
            toast({ title: 'Sucesso!', description: 'Extrato importado e transações salvas.', className: 'bg-emerald-500 text-white' });
            loadTransacoesPendentes();
            return true;
        } catch (error) {
            toast({ title: 'Erro na Importação', description: error.message, variant: 'destructive' });
            return false;
        }
    };

    const handleConciliar = async (transacaoId, lancamentoId) => {
        try {
            await conciliacaoService.conciliarTransacao(transacaoId, lancamentoId);
            toast({ title: 'Sucesso!', description: 'Transação conciliada.', className: 'bg-emerald-500 text-white' });
            loadTransacoesPendentes();
            setSelectedTransacao(null);
            setLancamentos([]);
        } catch (error) {
            toast({ title: 'Erro', description: `Falha ao conciliar: ${error.message}`, variant: 'destructive' });
        }
    };

    const handleIgnorar = async (transacaoId) => {
        try {
            await conciliacaoService.ignorarTransacao(transacaoId);
            toast({ title: 'Sucesso!', description: 'Transação ignorada.', className: 'bg-yellow-500 text-white' });
            loadTransacoesPendentes();
        } catch (error) {
            toast({ title: 'Erro', description: `Falha ao ignorar: ${error.message}`, variant: 'destructive' });
        }
    };
    
    const fetchLancamentos = async (transacao) => {
        setSelectedTransacao(transacao);
        try {
            const data = await conciliacaoService.getLancamentosParaConciliacao(transacao);
            setLancamentos(data);
        } catch (error) {
             toast({ title: 'Erro', description: 'Falha ao buscar lançamentos.', variant: 'destructive' });
        }
    };

    const filteredLancamentos = lancamentos.filter(l =>
        l.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <MapeamentoColunasDialog 
                open={isMappingOpen}
                setOpen={setIsMappingOpen}
                csvHeaders={csvData.headers}
                csvData={csvData.data}
                onConfirm={handleMappingConfirm}
            />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-effect">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <AlertTriangle className="w-6 h-6 text-yellow-400" />
                            <span>Conciliação Bancária</span>
                        </CardTitle>
                        <CardDescription>Importe extratos e concilie com seus lançamentos no sistema.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <Banknote className="w-5 h-5 text-cyan-400" />
                            <Select value={selectedConta} onValueChange={setSelectedConta} disabled={contasBancarias.length === 0}>
                                <SelectTrigger className="w-full sm:w-[250px]">
                                    <SelectValue placeholder="Selecione uma conta" />
                                </SelectTrigger>
                                <SelectContent>
                                    {contasBancarias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome_banco}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
                        <Button onClick={() => fileInputRef.current.click()} disabled={!selectedConta || loading}>
                            <Upload className="w-4 h-4 mr-2" /> Upload de Extrato (CSV)
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="glass-effect h-full">
                        <CardHeader><CardTitle>Transações do Extrato Pendentes</CardTitle></CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto h-[500px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead className="text-right">Valor</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading && <tr><TableCell colSpan={4} className="text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></tr>}
                                        {!loading && extratoTransacoes.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-gray-400">Nenhuma transação pendente.</TableCell></TableRow>}
                                        {!loading && extratoTransacoes.map(t => (
                                            <React.Fragment key={t.id}>
                                            <TableRow 
                                                className={`cursor-pointer hover:bg-slate-800 ${selectedTransacao?.id === t.id ? 'bg-slate-700' : ''}`}
                                                onClick={() => fetchLancamentos(t)}
                                            >
                                                <TableCell>{format(parseISO(t.data), 'dd/MM/yyyy')}</TableCell>
                                                <TableCell>{t.descricao}</TableCell>
                                                <TableCell className={`text-right font-semibold ${t.tipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(t.valor)}</TableCell>
                                                <TableCell>
                                                    <Button size="sm" variant="ghost" className="text-yellow-400 hover:text-yellow-300" onClick={(e) => { e.stopPropagation(); handleIgnorar(t.id);}}>
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                            {loadingSuggestions && <tr><TableCell colSpan={4} className="text-center py-2"><Loader2 className="w-4 h-4 animate-spin mx-auto text-cyan-400" /></TableCell></tr>}
                                            {sugestoes[t.id]?.length > 0 && (
                                                <TableRow className="bg-slate-800/50">
                                                    <TableCell colSpan={4} className="p-2">
                                                        <div className="text-xs text-cyan-400 mb-1 pl-2">Sugestões de conciliação:</div>
                                                        <ul className="space-y-1">
                                                        {sugestoes[t.id].map(sug => (
                                                            <li key={sug.id} className="flex justify-between items-center bg-slate-700/50 p-2 rounded-md">
                                                                <div>
                                                                    <span className="font-medium">{sug.descricao}</span>
                                                                    <span className="text-xs text-gray-400 ml-2">({format(parseISO(sug.data), 'dd/MM/yyyy')})</span>
                                                                </div>
                                                                <Button size="sm" variant="ghost" className="text-emerald-400" onClick={(e) => { e.stopPropagation(); handleConciliar(t.id, sug.id)}}>
                                                                    <Check className="w-4 h-4 mr-1" /> Conciliar
                                                                </Button>
                                                            </li>
                                                        ))}
                                                        </ul>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            </React.Fragment>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="glass-effect h-full">
                        <CardHeader>
                            <CardTitle>Lançamentos no Sistema</CardTitle>
                            <CardDescription>
                                {selectedTransacao ? `Buscando lançamentos para conciliar com: "${selectedTransacao.descricao}"` : 'Selecione uma transação do extrato para ver os lançamentos.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {selectedTransacao && (
                                <>
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input placeholder="Buscar lançamento..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                </div>
                                <div className="overflow-x-auto h-[440px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Data</TableHead>
                                                <TableHead>Descrição</TableHead>
                                                <TableHead className="text-right">Valor</TableHead>
                                                <TableHead>Ação</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredLancamentos.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-gray-400">Nenhum lançamento correspondente.</TableCell></TableRow>}
                                            {filteredLancamentos.map(l => (
                                                <TableRow key={l.id}>
                                                    <TableCell>{format(parseISO(l.data), 'dd/MM/yyyy')}</TableCell>
                                                    <TableCell>{l.descricao}</TableCell>
                                                    <TableCell className={`text-right font-semibold ${l.tipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(l.valor)}</TableCell>
                                                    <TableCell>
                                                        <Button size="sm" variant="outline" className="text-emerald-400 border-emerald-400/50 hover:bg-emerald-400/20 hover:text-emerald-300" onClick={() => handleConciliar(selectedTransacao.id, l.id)}>
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default ConciliacaoBancaria;