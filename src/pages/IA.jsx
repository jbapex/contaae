import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bot, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { iaService } from '@/lib/services/iaService';
import { IAgent } from '@/lib/ia-agent';
import ChatIA from '@/components/ia/ChatIA';
import { Link } from 'react-router-dom';

const IA = () => {
  const { toast } = useToast();
  const appData = useAppContext();
  const [agentActive, setAgentActive] = useState(false);
  const agentRef = useRef(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  useEffect(() => {
    const checkConfig = async () => {
      setIsLoading(true);
      try {
        const configured = await iaService.checkIaIsConfigured();
        setIsConfigured(configured);
        if (configured) {
          const savedHistory = iaService.getIaHistory();
          setHistory(savedHistory);
        }
      } catch (error) {
        toast({
          title: "Erro ao carregar configurações da IA",
          description: "Não foi possível verificar a configuração da chave de API.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    checkConfig();
  }, [toast]);

  const handleHistoryChange = useCallback((newHistory) => {
    setHistory(newHistory);
    iaService.saveIaHistory(newHistory);
  }, []);
  
  const processAndSendMessage = useCallback(async (messageText) => {
    if (!messageText.trim() || !agentActive || isLoading) return;
    
    const userMessage = { sender: 'user', text: messageText, timestamp: new Date().toISOString() };
    const newMessages = [...history, userMessage];
    handleHistoryChange(newMessages);
    setIsLoading(true);

    try {
      const response = await agentRef.current.processMessage(messageText);
      const botMessage = { sender: 'bot', text: response, timestamp: new Date().toISOString() };
      handleHistoryChange([...newMessages, botMessage]);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      const errorMessageText = error.message.includes('not configured')
        ? 'A chave de API da OpenAI não foi configurada pelo administrador do sistema. Por favor, entre em contato com o suporte.'
        : 'Desculpe, ocorreu um erro ao processar sua solicitação.';
      
      const errorMessage = { sender: 'bot', text: errorMessageText, timestamp: new Date().toISOString() };
      handleHistoryChange([...newMessages, errorMessage]);
      
      toast({
        title: "Erro de comunicação com a IA",
        description: error.message || "Não foi possível obter uma resposta.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [agentActive, history, isLoading, handleHistoryChange, toast]);


  const handleToggleAgent = useCallback(async () => {
    if (!agentActive) {
      if (!isConfigured) {
        toast({
          title: "Funcionalidade Indisponível",
          description: "O administrador do sistema ainda não configurou o Conselheiro IA.",
          variant: "destructive",
        });
        return;
      }
      
      if (appData.loading) {
        toast({ title: "Aguarde...", description: "Carregando dados do sistema." });
        return;
      }

      try {
        const newAgent = new IAgent(appData, history);
        agentRef.current = newAgent;
        setAgentActive(true);

        if (history.length === 0) {
          const welcomeMessage = {
            sender: 'bot',
            text: 'Olá! Sou seu conselheiro financeiro. Estou pronto para analisar seus dados e ajudar você a crescer. O que você gostaria de saber?',
            timestamp: new Date().toISOString()
          };
          handleHistoryChange([welcomeMessage]);
        }
        toast({ title: "Agente Ativado!", description: "O assistente de IA está pronto para ajudar.", className: "bg-emerald-500 text-white" });
      } catch (error) {
        console.error("Erro ao ativar o agente:", error);
        toast({
          title: "Erro ao ativar o agente",
          description: "Não foi possível iniciar o assistente de IA.",
          variant: "destructive"
        });
      }
    } else {
      agentRef.current = null;
      setAgentActive(false);
      toast({ title: "Agente Desativado", description: "O assistente de IA foi desligado." });
    }
  }, [agentActive, history, isConfigured, toast, handleHistoryChange, appData]);
  
  const loadConversation = (conversation) => {
    handleHistoryChange(conversation);
    setShowHistoryPanel(false);
    if (!agentActive) {
      handleToggleAgent();
    }
  };

  const groupedHistory = history.reduce((acc, msg) => {
    const date = new Date(msg.timestamp).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(msg);
    return acc;
  }, {});

  const conversationChunks = Object.values(groupedHistory);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div className="flex items-center space-x-3">
          <Sparkles className="w-10 h-10 text-fuchsia-400" />
          <div>
            <h1 className="text-3xl font-bold text-gradient">Conselheiro IA</h1>
            <p className="text-gray-400">Converse com seus dados financeiros.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="icon" onClick={() => setShowHistoryPanel(!showHistoryPanel)}>
              <History className="w-4 h-4"/>
            </Button>
          <Button onClick={handleToggleAgent} className={agentActive ? "bg-red-500 hover:bg-red-600" : "gradient-bg"}>
            {agentActive ? 'Desativar Conselheiro' : 'Ativar Conselheiro'}
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-8"
      >
        <AnimatePresence>
        {showHistoryPanel && (
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="w-1/3 lg:w-1/4 h-[70vh] glass-effect rounded-lg p-4 overflow-y-auto"
            >
                <h3 className="text-lg font-semibold mb-4">Histórico</h3>
                <div className="space-y-4">
                  {conversationChunks.length > 0 ? conversationChunks.map((chunk, index) => (
                    <div key={index} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer" onClick={() => loadConversation(chunk)}>
                      <p className="font-semibold text-sm">{new Date(chunk[0].timestamp).toLocaleDateString('pt-BR')}</p>
                      <p className="text-xs text-gray-400 truncate">{chunk.find(m => m.sender === 'user')?.text || 'Início da conversa'}</p>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-400 text-center mt-8">Nenhuma conversa encontrada.</p>
                  )}
                </div>
            </motion.div>
        )}
        </AnimatePresence>

        <div className={showHistoryPanel ? 'w-2/3 lg:w-3/4' : 'w-full'}>
          {!isConfigured && !agentActive ? (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center text-gray-400 glass-effect rounded-lg">
              <Bot className="w-20 h-20 mb-6 opacity-30" />
              <h3 className="text-2xl font-semibold mb-2">Conselheiro IA Indisponível</h3>
              <p className="max-w-md mb-6">Esta funcionalidade precisa ser configurada pelo administrador do sistema.</p>
              <p className="text-xs">Se você é o administrador, acesse o painel <span className="font-bold">Super Admin &gt; Configurações Globais</span>.</p>
            </div>
          ) : (
            <ChatIA 
              isActive={agentActive} 
              initialHistory={history}
              onHistoryChange={handleHistoryChange}
              isLoading={isLoading}
              onSendMessage={processAndSendMessage}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default IA;