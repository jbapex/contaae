import React from 'react';
    import { motion } from 'framer-motion';
    import { Users, Plus, Trash2 } from 'lucide-react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';

    const ClientesCard = ({ clientes, onAdd = () => {}, onDelete }) => {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>Clientes</span>
                </CardTitle>
                <Button size="sm" onClick={() => onAdd && onAdd('cliente')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Cliente
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
                {clientes.map((cliente, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded bg-white/5">
                    <span>{cliente}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(cliente)}
                      className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {clientes.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum cliente cadastrado</p>
                  <p className="text-sm">Adicione seus primeiros clientes!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default ClientesCard;