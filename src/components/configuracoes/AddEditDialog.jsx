import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AddEditDialog = ({ isOpen, onClose, onSave, itemType, itemData }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (itemType === 'categoria') {
      setFormData(itemData || { nome: '', tipo: 'entrada' });
    } else {
      setFormData(itemData || { nome: '' });
    }
  }, [isOpen, itemType, itemData]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSave(itemType, formData);
  };

  const getTitle = () => {
    const action = itemData ? 'Editar' : 'Nova';
    switch (itemType) {
      case 'categoria':
        return `${action} Categoria`;
      case 'cliente':
        return `${action} Cliente`;
      case 'etapa':
        return `${action} Etapa`;
      default:
        return `${action} Item`;
    }
  };

  const getLabel = () => {
    switch (itemType) {
      case 'categoria':
        return 'Nome da Categoria';
      case 'cliente':
        return 'Nome do Cliente';
      case 'etapa':
        return 'Nome da Etapa';
      default:
        return 'Nome';
    }
  };

  const getPlaceholder = () => {
    switch (itemType) {
      case 'categoria':
        return 'Ex: Marketing Digital';
      case 'cliente':
        return 'Ex: Apex Legends';
      case 'etapa':
        return 'Ex: Prospecção';
      default:
        return 'Digite o nome';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-white/20">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">{getLabel()}</Label>
            <Input
              id="nome"
              placeholder={getPlaceholder()}
              value={formData.nome || ''}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
            />
          </div>

          {itemType === 'categoria' && (
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={formData.tipo || 'entrada'} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-bg">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditDialog;