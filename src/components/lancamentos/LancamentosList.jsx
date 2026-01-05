import React from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Edit, Trash2, Calendar, Landmark, Package } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useAppContext } from '@/contexts/AppContext';

    const LancamentosList = ({ lancamentos, onEdit, onDelete }) => {
      const { settings } = useAppContext();

      const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      };

      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      };

      if (lancamentos.length === 0) {
        return (
          <div className="text-center py-16 text-gray-400 bg-white/5 rounded-lg">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold">Nenhum lançamento encontrado</h3>
            <p className="text-sm">Ajuste os filtros ou adicione novos lançamentos.</p>
          </div>
        );
      }

      return (
        <div className="space-y-3 overflow-hidden">
          <AnimatePresence>
            {lancamentos.map((lancamento, index) => (
              <motion.div
                key={lancamento.id}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 30 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors gap-4"
              >
                <div className="flex-1 flex items-start space-x-4 min-w-0">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${
                    lancamento.tipo === 'entrada' ? 'bg-emerald-500' : 'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{lancamento.descricao}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 text-sm text-gray-400">
                      <span>{formatDate(lancamento.data)}</span>
                      {lancamento.categoria && lancamento.categoria !== 'Nenhuma' && <span>• {lancamento.categoria}</span>}
                      {lancamento.clienteNome && lancamento.clienteNome !== 'Nenhum' && <span>• {lancamento.clienteNome}</span>}
                      {settings?.contas_bancarias_ativo && lancamento.conta_bancaria_nome && lancamento.conta_bancaria_nome !== 'Nenhuma' && (
                        <span className="flex items-center gap-1.5">• <Landmark className="w-3 h-3" /> {lancamento.conta_bancaria_nome}</span>
                      )}
                      {settings?.estoque_ativo && lancamento.produto_nome && (
                        <span className="flex items-center gap-1.5">• <Package className="w-3 h-3" /> {lancamento.produto_nome}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
                  <span className={`text-lg font-bold truncate ${
                    lancamento.tipo === 'entrada' ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {lancamento.tipo === 'entrada' ? '+' : '-'} {formatCurrency(parseFloat(lancamento.valor))}
                  </span>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(lancamento)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(lancamento.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      );
    };

    export default LancamentosList;