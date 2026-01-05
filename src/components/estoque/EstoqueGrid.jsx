import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, MoreHorizontal, ArrowRightLeft, History, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const EstoqueGrid = ({ produtos, onEdit, onMovimentar, onHistorico, onDelete, formatCurrency }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence>
        {produtos.map((produto, index) => (
          <motion.div
            key={produto.id}
            layout
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="glass-effect h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{produto.nome}</CardTitle>
                    <CardDescription className="capitalize">{produto.tipo}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Abrir menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(produto)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                      {produto.tipo === 'produto' && <DropdownMenuItem onClick={() => onMovimentar(produto)}><ArrowRightLeft className="mr-2 h-4 w-4" /> Movimentar</DropdownMenuItem>}
                      {produto.tipo === 'produto' && <DropdownMenuItem onClick={() => onHistorico(produto)}><History className="mr-2 h-4 w-4" /> Histórico</DropdownMenuItem>}
                      <DropdownMenuItem onClick={() => onDelete(produto)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Deletar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                {produto.tipo === 'produto' ? (
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-300">Em Estoque</span>
                    <div className="flex items-center gap-2">
                       {produto.quantidade_estoque <= 5 && (
                        <TooltipProvider>
                           <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Estoque baixo</p>
                              </TooltipContent>
                           </Tooltip>
                        </TooltipProvider>
                       )}
                       <span className={`text-lg font-bold ${produto.quantidade_estoque <= 5 ? 'text-yellow-400' : 'text-white'}`}>{produto.quantidade_estoque}</span>
                       <span className="text-xs text-gray-400">{produto.unidade_medida || 'un'}</span>
                    </div>
                  </div>
                ) : <div className="h-[68px]"></div>}
                 <div className="text-sm space-y-2">
                   <div className="flex justify-between">
                     <span className="text-gray-400">Preço Custo</span>
                     <span>{formatCurrency(produto.preco_custo)}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-400">Preço Venda</span>
                     <span className="font-semibold text-emerald-400">{formatCurrency(produto.preco_venda)}</span>
                   </div>
                 </div>
              </CardContent>
              <CardFooter>
                 <Badge variant={produto.ativo ? 'success' : 'secondary'} className="w-full justify-center">{produto.ativo ? 'Ativo' : 'Inativo'}</Badge>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default EstoqueGrid;