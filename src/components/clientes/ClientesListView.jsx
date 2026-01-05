import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, DollarSign, MoreVertical, Repeat, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const StatusBadge = ({ statusName }) => {
  if (!statusName) return <Badge variant="secondary">Sem Etapa</Badge>;

  const variantMapping = {
    'ativo': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'stand by': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'inativo': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    'perdido': 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  
  const defaultVariant = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  const statusKey = statusName.toLowerCase();
  const variantClass = variantMapping[statusKey] || defaultVariant;

  return <Badge className={`capitalize ${variantClass}`}>{statusName}</Badge>;
};

function ClientesListView({ clientes, etapas, onEdit, onDelete, onUpdateStatus, onSetupRecorrencia, formatCurrency, crediarioAtivo }) {
  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle>Lista de Clientes ({clientes.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {clientes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum cliente encontrado</p>
            <p className="text-sm">Adicione novos clientes ou ajuste a busca</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clientes.map((cliente, index) => (
              <motion.div
                key={cliente.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center"
              >
                <div className="flex-1 mb-4 sm:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{cliente.nome}</h3>
                    {cliente.is_recorrente && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Repeat className="w-4 h-4 text-cyan-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Cliente Recorrente</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <StatusBadge statusName={cliente.etapa_nome} />
                </div>

                <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-4 sm:gap-6 items-center text-sm w-full sm:w-auto">
                  <div className="flex items-center gap-1.5" title="Entradas">
                    <TrendingUp className="w-4 h-4 text-emerald-500"/>
                    <span className="text-emerald-500 font-medium">{formatCurrency(cliente.entradas)}</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Saídas">
                    <TrendingDown className="w-4 h-4 text-red-500"/>
                    <span className="text-red-500 font-medium">{formatCurrency(cliente.saidas)}</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Lucro">
                    <DollarSign className="w-4 h-4"/>
                    <span className={`font-bold ${cliente.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(cliente.lucro)}</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Lançamentos">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">{cliente.lancamentos.length}</span>
                  </div>
                </div>

                <div className="ml-0 mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onEdit(cliente)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Cliente
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup value={cliente.etapa_id} onValueChange={(etapaId) => onUpdateStatus(cliente.id, { etapa_id: etapaId })}>
                          {etapas.map(etapa => (
                              <DropdownMenuRadioItem key={etapa.id} value={etapa.id}>{etapa.nome}</DropdownMenuRadioItem>
                          ))}
                      </DropdownMenuRadioGroup>
                      <DropdownMenuSeparator />
                      {crediarioAtivo && (
                        <DropdownMenuItem onSelect={() => onSetupRecorrencia(cliente)}>
                          <Repeat className="w-4 h-4 mr-2" />
                          Configurar Recorrência
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onSelect={() => onDelete(cliente)} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                        Remover Cliente
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ClientesListView;