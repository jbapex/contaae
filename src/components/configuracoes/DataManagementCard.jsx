import React from 'react';
import { motion } from 'framer-motion';
import { Database, Download, Upload, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DataManagementCard = ({ onExport, onImport, onClear }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span>Gerenciamento de Dados</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-400">Exporte seus dados, importe em massa ou limpe o sistema.</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            
            <Button onClick={onImport} variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Importar em Massa
            </Button>
            
            <Button onClick={onClear} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Dados
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DataManagementCard;