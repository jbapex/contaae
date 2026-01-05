import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Landmark, Plus, Edit, Trash2, MoreHorizontal, Loader2, FileDown, Wallet, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { contaBancariaService } from '@/lib/services/contaBancariaService';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import ContaBancariaForm from '@/components/contas-bancarias/ContaBancariaForm';
import ExportarRelatorioDialog from '@/components/contas-bancarias/ExportarRelatorioDialog';
import TransferenciaContasDialog from '@/components/contas-bancarias/TransferenciaContasDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import useMediaQuery from '@/hooks/useMediaQuery';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const ContasBancarias = () => {
    const [contas, setContas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [selectedConta, setSelectedConta] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [contaToDelete, setContaToDelete] = useState(null);
    const { toast } = useToast();
    const isMobile = useMediaQuery("(max-width: 768px)");

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await contaBancariaService.getContasComSaldos();
            setContas(data);
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível carregar as contas bancárias.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSave = async (data) => {
        try {
            await contaBancariaService.saveContaBancaria(data);
            toast({ title: "Sucesso!", description: `Conta ${data.id ? 'atualizada' : 'criada'} com sucesso.` });
            loadData();
            return true;
        } catch (error) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
            return false;
        }
    };

    const handleDelete = (conta) => {
        setContaToDelete(conta);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!contaToDelete) return;
        try {
            await contaBancariaService.deleteContaBancaria(contaToDelete.id);
            toast({ title: "Sucesso!", description: "Conta bancária deletada." });
            loadData();
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível deletar a conta. Verifique se há lançamentos associados.", variant: "destructive" });
        } finally {
            setIsConfirmOpen(false);
            setContaToDelete(null);
        }
    };

    const handleEdit = (conta) => {
        setSelectedConta(conta);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setSelectedConta(null);
        setIsFormOpen(true);
    };

    const handleTransferencia = async (transferData) => {
        try {
            await contaBancariaService.transferirEntreContas(transferData);
            toast({ title: "Sucesso!", description: "Transferência realizada com sucesso." });
            loadData();
            return true;
        } catch (error) {
            toast({ title: "Erro na Transferência", description: error.message, variant: "destructive" });
            return false;
        }
    };

    const totalSaldoConsolidado = contas
        .filter(c => c.status === 'ativa')
        .reduce((acc, conta) => acc + (conta.saldo_calculado || 0), 0);

    const MobileContasView = () => (
        <Accordion type="single" collapsible className="w-full">
            {contas.map(conta => (
                <AccordionItem value={conta.id} key={conta.id}>
                    <AccordionTrigger>
                        <div className="flex justify-between items-center w-full pr-4">
                            <span className="font-medium text-left">{conta.nome_banco}</span>
                            <span className="font-semibold text-right">{formatCurrency(conta.saldo_calculado)}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 text-sm text-gray-300">
                            <div className="flex justify-between"><span>Tipo:</span> <span className="capitalize">{conta.tipo}</span></div>
                            <div className="flex justify-between"><span>Status:</span> <Badge variant={conta.status === 'ativa' ? 'success' : 'secondary'}>{conta.status}</Badge></div>
                            <div className="flex justify-between"><span>Saldo Informado:</span> <span>{formatCurrency(conta.saldo_inicial)}</span></div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(conta)}><Edit className="mr-2 h-3 w-3" /> Editar</Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(conta)}><Trash2 className="mr-2 h-3 w-3" /> Deletar</Button>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );

    const DesktopContasView = () => (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome do Banco</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Saldo Informado</TableHead>
                        <TableHead className="text-right">Saldo do Sistema</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contas.map(conta => (
                        <TableRow key={conta.id}>
                            <TableCell className="font-medium whitespace-nowrap">{conta.nome_banco}</TableCell>
                            <TableCell className="capitalize">{conta.tipo}</TableCell>
                            <TableCell><Badge variant={conta.status === 'ativa' ? 'success' : 'secondary'}>{conta.status}</Badge></TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatCurrency(conta.saldo_inicial)}</TableCell>
                            <TableCell className="text-right font-semibold whitespace-nowrap">{formatCurrency(conta.saldo_calculado)}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEdit(conta)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDelete(conta)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Deletar</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                    <Landmark className="w-8 h-8 sm:w-10 sm:h-10 text-fuchsia-400" />
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Contas Bancárias</h1>
                        <p className="text-sm text-gray-400">Gerencie e concilie suas contas bancárias.</p>
                    </div>
                </div>
                <Button onClick={handleAddNew} className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Nova Conta</Button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1">
                    <Card className="glass-effect h-full">
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
                                <div>
                                    <CardTitle className="text-lg sm:text-xl">Saldo Total Consolidado</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">Soma das contas ativas.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl sm:text-3xl font-bold text-cyan-400">{formatCurrency(totalSaldoConsolidado)}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
                    <Card className="glass-effect h-full">
                        <CardHeader>
                            <CardTitle className="text-lg sm:text-xl">Ferramentas</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Exporte relatórios ou transfira valores.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-4">
                            <Button variant="outline" onClick={() => setIsExportOpen(true)} className="w-full sm:w-auto">
                                <FileDown className="w-4 h-4 mr-2" />
                                Exportar Relatório
                            </Button>
                            <Button variant="outline" onClick={() => setIsTransferOpen(true)} className="w-full sm:w-auto">
                                <ArrowRightLeft className="w-4 h-4 mr-2" />
                                Movimentar Saldo
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <Card className="glass-effect">
                <CardHeader>
                    <CardTitle>Suas Contas</CardTitle>
                    <CardDescription>Visualize o saldo informado e o saldo calculado pelo sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div> :
                        (isMobile ? <MobileContasView /> : <DesktopContasView />)
                    }
                </CardContent>
            </Card>

            <ContaBancariaForm open={isFormOpen} setOpen={setIsFormOpen} conta={selectedConta} onSave={handleSave} />
            <ExportarRelatorioDialog open={isExportOpen} setOpen={setIsExportOpen} />
            <TransferenciaContasDialog open={isTransferOpen} setOpen={setIsTransferOpen} onConfirm={handleTransferencia} contas={contas.filter(c => c.status === 'ativa')} />
            <ConfirmationDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                description={`Tem certeza que deseja excluir a conta "${contaToDelete?.nome_banco}"? Esta ação não pode ser desfeita.`}
            />
        </div>
    );
};

export default ContasBancarias;