import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus, Trash2, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const CategoriaList = ({ tipo, categorias, onDelete }) => (
  <div>
    <h4 className={`font-semibold ${tipo === 'entradas' ? 'text-emerald-500' : 'text-red-500'} mb-3`}>
      {tipo === 'entradas' ? 'Entradas' : 'Saídas'}
    </h4>
    <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
      {categorias.map((categoria, index) => (
        <div key={index} className="flex items-center justify-between p-2 rounded bg-white/5">
          <span className="text-sm">{categoria}</span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-effect">
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso removerá permanentemente a categoria "{categoria}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete && onDelete(tipo, categoria)}>
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </div>
  </div>
);

const CategoriasCard = ({ categorias, onAdd = () => {}, onDelete = () => {}, onImport }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-emerald-500" />
              <span>Categorias</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={onImport}>
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
              <Button size="sm" onClick={() => onAdd && onAdd('categoria')}>
                <Plus className="w-4 h-4 mr-2" />
                Nova
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <CategoriaList tipo="entradas" categorias={categorias.entradas} onDelete={onDelete} />
          <CategoriaList tipo="saidas" categorias={categorias.saidas} onDelete={onDelete} />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CategoriasCard;