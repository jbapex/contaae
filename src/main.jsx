import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { Toaster } from "@/components/ui/toaster";
import '@/index.css';
import { DndProvider } from '@/contexts/DndContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AppProvider>
        <DndProvider>
          <App />
        </DndProvider>
        <Toaster />
      </AppProvider>
    </AuthProvider>
  </React.StrictMode>
);