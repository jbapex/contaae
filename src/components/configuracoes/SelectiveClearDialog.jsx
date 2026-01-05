import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';

const dataTypes = [
  { id: 'lancamentos', label: 'Lançamentos Financeiros' },
  { id: 'clientes', label: 'Clientes e Contas a Receber' },
  { id: 'fornecedores', label: 'Fornecedores e Contas a Pagar' },
  { id: 'categorias', label: 'Categorias' },
  { id: 'etapas', label: 'Etapas do Kanban' },
  { id: 'contas_bancarias', label: 'Contas Bancárias' },
];

const SelectiveClearDialog = ({ isOpen, onClose, onConfirm }) => {
  const [selected, setSelected] = useState({});

  const handleCheckboxChange = (id) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirm = () => {
    const itemsToClear = Object.keys(selected).filter(key => selected[key]);
    if (itemsToClear.length > 0) {
      onConfirm(itemsToClear);
    }
  };

  const isConfirmDisabled = Object.values(selected).every(v => !v);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="text-destructive" />
            Limpeza Seletiva de Dados
          </DialogTitle>
          <DialogDescription>
            Selecione os tipos de dados que você deseja apagar permanentemente. Esta ação é irreversível.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {dataTypes.map(item => (
            <div key={item.id} className="flex items-center space-x-3">
              <Checkbox
                id={item.id}
                checked={!!selected[item.id]}
                onCheckedChange={() => handleCheckboxChange(item.id)}
              />
              <Label htmlFor={item.id} className="text-base font-normal text-gray-200 cursor-pointer">
                {item.label}
              </Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Dados Selecionados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectiveClearDialog;