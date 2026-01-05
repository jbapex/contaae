import React, { useEffect } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, GripVertical, Repeat, MoreVertical, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { etapaService } from '@/lib/services/etapaService';

const ClienteCard = ({ cliente, index, formatCurrency, onSetupRecorrencia, crediarioAtivo, onEdit }) => (
  <Draggable draggableId={cliente.id.toString()} index={index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        style={{...provided.draggableProps.style}}
        className={`p-4 mb-4 rounded-lg bg-slate-800/50 hover:bg-slate-800/80 transition-colors border border-slate-700 ${snapshot.isDragging ? 'shadow-2xl shadow-emerald-500/30' : ''}`}
      >
        <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-gray-200">{cliente.nome}</h3>
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
            </div>
            <div className="flex items-center">
              <div {...provided.dragHandleProps}>
                <GripVertical className="w-5 h-5 text-gray-500 cursor-grab"/>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => onEdit(cliente)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  {crediarioAtivo && (
                    <DropdownMenuItem onSelect={() => onSetupRecorrencia(cliente)}>
                      <Repeat className="w-4 h-4 mr-2" />
                      Recorrência
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </div>
        
        <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
                <span className="text-gray-400 flex items-center"><TrendingUp className="w-4 h-4 mr-1 text-emerald-500"/>Entradas:</span>
                <span className="text-emerald-500 font-medium">{formatCurrency(cliente.entradas)}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-400 flex items-center"><TrendingDown className="w-4 h-4 mr-1 text-red-500"/>Saídas:</span>
                <span className="text-red-500 font-medium">{formatCurrency(cliente.saidas)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-700 pt-2 mt-2">
                <span className="text-gray-400 flex items-center"><DollarSign className="w-4 h-4 mr-1"/>Lucro:</span>
                <span className={`font-bold ${cliente.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(cliente.lucro)}</span>
            </div>
        </div>
      </div>
    )}
  </Draggable>
);

const KanbanColumn = ({ etapa, clientes, formatCurrency, onSetupRecorrencia, crediarioAtivo, onEdit }) => (
  <Card className="glass-effect w-80 flex-shrink-0">
    <CardHeader>
      <CardTitle className="text-gradient capitalize">{etapa.nome} ({clientes.length})</CardTitle>
    </CardHeader>
    <CardContent>
      <Droppable droppableId={etapa.id.toString()}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[400px] p-2 rounded-md transition-colors ${snapshot.isDraggingOver ? 'bg-emerald-500/10' : ''}`}
          >
            {clientes.map((cliente, index) => (
              <ClienteCard 
                key={cliente.id} 
                cliente={cliente} 
                index={index} 
                formatCurrency={formatCurrency} 
                onSetupRecorrencia={onSetupRecorrencia}
                crediarioAtivo={crediarioAtivo}
                onEdit={onEdit}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </CardContent>
  </Card>
);

function ClientesKanbanView({ clientes, etapas, setEtapas, onUpdateCliente, onSetupRecorrencia, formatCurrency, crediarioAtivo, onEdit }) {
  
  useEffect(() => {
    window.onDragEnd = (result) => {
      const { source, destination, draggableId, type } = result;

      if (!destination) return;

      if (type === 'column') {
        const newEtapas = Array.from(etapas);
        const [reorderedItem] = newEtapas.splice(source.index, 1);
        newEtapas.splice(destination.index, 0, reorderedItem);
        
        const updatedOrder = newEtapas.map((etapa, index) => ({...etapa, ordem: index}));
        setEtapas(updatedOrder);
        etapaService.updateEtapasOrder(updatedOrder);
        return;
      }

      if (source.droppableId === destination.droppableId) return;

      onUpdateCliente(draggableId, { etapa_id: destination.droppableId });
    };
    
    return () => {
      window.onDragEnd = null;
    }
  }, [etapas, onUpdateCliente, setEtapas]);

  const clientesPorEtapa = etapas.reduce((acc, etapa) => {
    acc[etapa.id] = clientes.filter(c => c.etapa_id === etapa.id);
    return acc;
  }, {});

  const clientesSemEtapa = clientes.filter(c => !c.etapa_id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex space-x-4 overflow-x-auto p-4 scrollbar-thin">
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex space-x-4"
            >
              {etapas.map((etapa, index) => (
                <Draggable key={etapa.id} draggableId={etapa.id} index={index}>
                  {(provided) => (
                     <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <KanbanColumn
                          etapa={etapa}
                          clientes={clientesPorEtapa[etapa.id] || []}
                          formatCurrency={formatCurrency}
                          onSetupRecorrencia={onSetupRecorrencia}
                          crediarioAtivo={crediarioAtivo}
                          onEdit={onEdit}
                        />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {clientesSemEtapa.length > 0 && (
            <KanbanColumn 
              etapa={{ id: 'sem-etapa', nome: 'Sem Etapa' }} 
              clientes={clientesSemEtapa} 
              formatCurrency={formatCurrency} 
              onSetupRecorrencia={onSetupRecorrencia}
              crediarioAtivo={crediarioAtivo}
              onEdit={onEdit}
            />
        )}
    </motion.div>
  );
}

export default ClientesKanbanView;