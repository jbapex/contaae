import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Truck, PlusCircle, Edit, Trash2, MoreHorizontal, Loader2, Mail, Phone, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { fornecedorService } from '@/lib/services/fornecedorService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ConfirmationDialog from '@/components/ConfirmationDialog';
import useMediaQuery from '@/hooks/useMediaQuery';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FornecedorForm = ({ open, setOpen, fornecedor, onSave }) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (fornecedor) {
      setFormData(fornecedor);
    } else {
      setFormData({ nome: '', documento: '', email: '', telefone: '', tipo: '', ativo: true });
    }
  }, [fornecedor, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{formData.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
          <DialogDescription>
            {formData.id ? 'Atualize os dados do fornecedor.' : 'Adicione um novo fornecedor para vincular às suas despesas.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">Nome</Label>
              <Input id="nome" name="nome" value={formData.nome || ''} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="documento" className="text-right">CNPJ/CPF</Label>
              <Input id="documento" name="documento" value={formData.documento || ''} onChange={handleChange} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" name="email" value={formData.email || ''} onChange={handleChange} className="col-span-3" type="email" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefone" className="text-right">Telefone</Label>
              <Input id="telefone" name="telefone" value={formData.telefone || ''} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo" className="text-right">Tipo</Label>
              <Input id="tipo" name="tipo" value={formData.tipo || ''} onChange={handleChange} className="col-span-3" placeholder="Ex: Serviço, Produto..."/>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


const Fornecedores = () => {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [fornecedorToDelete, setFornecedorToDelete] = useState(null);
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const loadFornecedores = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fornecedorService.getFornecedores();
      setFornecedores(data);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível carregar os fornecedores.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadFornecedores();
  }, [loadFornecedores]);

  const handleSave = async (fornecedorData) => {
    try {
      await fornecedorService.saveFornecedor(fornecedorData);
      toast({ title: "Sucesso!", description: `Fornecedor ${fornecedorData.id ? 'atualizado' : 'criado'} com sucesso.` });
      loadFornecedores();
    } catch (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = (fornecedor) => {
    setFornecedorToDelete(fornecedor);
    setIsConfirmOpen(true);
  };
  
  const confirmDelete = async () => {
    if(!fornecedorToDelete) return;
    try {
      await fornecedorService.deleteFornecedor(fornecedorToDelete.id);
      toast({ title: "Sucesso!", description: "Fornecedor deletado com sucesso." });
      loadFornecedores();
    } catch(error) {
      toast({ title: "Erro", description: "Não foi possível deletar o fornecedor.", variant: "destructive" });
    } finally {
      setIsConfirmOpen(false);
      setFornecedorToDelete(null);
    }
  }

  const handleEdit = (fornecedor) => {
    setSelectedFornecedor(fornecedor);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedFornecedor(null);
    setIsFormOpen(true);
  };

  const renderDesktopView = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fornecedores.map((fornecedor) => (
            <TableRow key={fornecedor.id}>
              <TableCell className="font-medium">{fornecedor.nome}</TableCell>
              <TableCell>{fornecedor.tipo}</TableCell>
              <TableCell>{fornecedor.email}</TableCell>
              <TableCell>{fornecedor.telefone}</TableCell>
              <TableCell>
                <Badge variant={fornecedor.ativo ? 'default' : 'secondary'}>
                  {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(fornecedor)}>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(fornecedor)} className="text-red-500">
                       <Trash2 className="mr-2 h-4 w-4" /> Deletar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderMobileView = () => (
    <Accordion type="single" collapsible className="w-full">
      {fornecedores.map((fornecedor) => (
        <AccordionItem value={fornecedor.id} key={fornecedor.id} className="border-b-0">
          <AccordionTrigger className="flex justify-between items-center p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 data-[state=open]:rounded-b-none">
            <div className="flex-1 text-left">
              <p className="font-semibold text-white">{fornecedor.nome}</p>
            </div>
            <Badge variant={fornecedor.ativo ? 'success' : 'secondary'} className="ml-4">
              {fornecedor.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
          </AccordionTrigger>
          <AccordionContent className="p-4 bg-slate-800/30 rounded-b-lg space-y-3">
            <div className="text-sm text-gray-300 space-y-2">
              {fornecedor.tipo && <p className="flex items-center"><Tag className="w-4 h-4 mr-2 text-cyan-400" /> <strong>Tipo:</strong><span className="ml-2">{fornecedor.tipo}</span></p>}
              {fornecedor.email && <p className="flex items-center"><Mail className="w-4 h-4 mr-2 text-cyan-400" /> <strong>Email:</strong><span className="ml-2">{fornecedor.email}</span></p>}
              {fornecedor.telefone && <p className="flex items-center"><Phone className="w-4 h-4 mr-2 text-cyan-400" /> <strong>Telefone:</strong><span className="ml-2">{fornecedor.telefone}</span></p>}
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(fornecedor)}>
                <Edit className="w-4 h-4 mr-2" /> Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(fornecedor)}>
                <Trash2 className="w-4 h-4 mr-2" /> Deletar
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  return (
    <div className="space-y-6">
       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Truck className="w-10 h-10 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold text-gradient">Fornecedores</h1>
              <p className="text-gray-400">Gerencie seus parceiros e fornecedores.</p>
            </div>
          </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Fornecedor
          </Button>
        </div>
      </motion.div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Lista de Fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
          ) : (
            isMobile ? renderMobileView() : renderDesktopView()
          )}
        </CardContent>
      </Card>
      
      <FornecedorForm 
        open={isFormOpen} 
        setOpen={setIsFormOpen} 
        fornecedor={selectedFornecedor} 
        onSave={handleSave} 
      />

      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o fornecedor "${fornecedorToDelete?.nome}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default Fornecedores;