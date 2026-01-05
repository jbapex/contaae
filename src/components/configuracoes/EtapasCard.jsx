import React from 'react';
    import { motion } from 'framer-motion';
    import { Columns, Plus, Trash2 } from 'lucide-react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';

    const EtapasCard = ({ etapas, onAdd = () => {}, onDelete = () => {}, className }) => {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={className}
        >
          <Card className="glass-effect h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Columns className="w-5 h-5 text-purple-500" />
                  <span>Etapas do Kanban</span>
                </CardTitle>
                <Button size="sm" onClick={onAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Etapa
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
                {etapas.map((etapa) => (
                  <div key={etapa.id} className="flex items-center justify-between p-3 rounded bg-white/5">
                    <span>{etapa.nome}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(etapa)}
                      className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {etapas.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Columns className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma etapa cadastrada</p>
                  <p className="text-sm">Adicione suas primeiras etapas!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default EtapasCard;