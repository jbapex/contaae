import React from 'react';
    import { DragDropContext } from '@hello-pangea/dnd';

    export const DndProvider = ({ children }) => {
      const onDragEnd = (result) => {
        // A lógica de onDragEnd será gerenciada no componente que usa o context
        // Aqui, apenas fornecemos o wrapper
        if (window.onDragEnd) {
          window.onDragEnd(result);
        }
      };

      return (
        <DragDropContext onDragEnd={onDragEnd}>
          {children}
        </DragDropContext>
      );
    };