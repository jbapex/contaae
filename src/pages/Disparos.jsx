import React from 'react';
import { motion } from 'framer-motion';
import { Send, CalendarClock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DisparoManual from '@/components/disparos/DisparoManual';
import DisparosAutomaticos from '@/components/disparos/DisparosAutomaticos';

const Disparos = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center space-x-3">
          <Send className="w-10 h-10 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold text-gradient">Disparos via WhatsApp</h1>
            <p className="text-gray-400">Envie relatórios de forma manual ou configure envios automáticos.</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">
            <Send className="mr-2 h-4 w-4" />
            Disparo Manual
          </TabsTrigger>
          <TabsTrigger value="automatico">
            <CalendarClock className="mr-2 h-4 w-4" />
            Disparos Automáticos
          </TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="mt-6">
          <DisparoManual />
        </TabsContent>
        <TabsContent value="automatico" className="mt-6">
          <DisparosAutomaticos />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Disparos;