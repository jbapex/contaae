import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, CornerDownLeft, Sparkles, AlertTriangle, TrendingDown, Users, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const ChatIA = ({ agent, isActive, initialHistory, onHistoryChange, isLoading, onSendMessage }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const suggestionPrompts = [
    { icon: TrendingDown, text: "Por que o lucro deste mês caiu?" },
    { icon: Users, text: "Quais clientes são mais lucrativos?" },
    { icon: AlertTriangle, text: "Onde posso cortar gastos?" },
    { icon: HelpCircle, text: "Como posso usar o lucro deste mês?" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [initialHistory, isLoading]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || !isActive || isLoading) return;
    onSendMessage(input);
    setInput('');
  };
  
  const handleSuggestionClick = (prompt) => {
    onSendMessage(prompt);
  };

  const renderMessageContent = (text) => {
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\n- /g, '<br>• ');
    return <div dangerouslySetInnerHTML={{ __html: html.replace(/\n/g, '<br />') }} />;
  };

  return (
    <div className="flex flex-col h-[70vh] glass-effect rounded-lg border border-white/10">
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        <AnimatePresence>
          {initialHistory.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              layout
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div className={`max-w-xl p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-slate-700'}`}>
                <div className="text-sm leading-relaxed">{renderMessageContent(msg.text)}</div>
              </div>
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="max-w-md p-3 rounded-lg bg-slate-700 flex items-center space-x-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-pulse delay-300"></span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </AnimatePresence>
        {!isActive && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <Sparkles className="w-16 h-16 mb-4 opacity-30" />
            <h3 className="text-xl font-semibold">Conselheiro Desativado</h3>
            <p className="max-w-sm">Ative o agente para começar a conversar com seus dados.</p>
          </div>
        )}
      </div>
      
      {isActive && initialHistory.length <= 1 && !isLoading && (
        <div className="p-4 border-t border-white/10">
          <p className="text-sm text-gray-400 mb-2 text-center">Sugestões para começar:</p>
          <div className="grid grid-cols-2 gap-2">
            {suggestionPrompts.map((prompt, i) => {
              const Icon = prompt.icon;
              return (
                <Button key={i} variant="outline" className="text-xs h-auto justify-start text-left py-2" onClick={() => handleSuggestionClick(prompt.text)}>
                  <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                  {prompt.text}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-white/10">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-3">
          <Input
            type="text"
            placeholder={isActive ? "Converse com seu Conselheiro IA..." : "Ative o agente para começar"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!isActive || isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!isActive || isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          Pressione <CornerDownLeft className="w-3 h-3" /> para enviar.
        </p>
      </div>
    </div>
  );
};

export default ChatIA;