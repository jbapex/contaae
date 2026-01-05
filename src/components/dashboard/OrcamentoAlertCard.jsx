import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, TrendingDown, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const OrcamentoAlertCard = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const getAlertDetails = (alert) => {
    if (alert.meta_despesa === 0) return null; // Evita divisão por zero
    
    const percentual = (alert.realizado_despesa / alert.meta_despesa) * 100;
    
    if (percentual > 100) {
      const percentualExcedido = ((alert.realizado_despesa - alert.meta_despesa) / alert.meta_despesa) * 100;
      return {
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        title: "Orçamento Estourado",
        badgeVariant: "destructive",
        badgeText: `+${percentualExcedido.toFixed(0)}%`,
        textColor: "text-red-400",
        message: `Você ultrapassou a meta em ${formatCurrency(alert.realizado_despesa - alert.meta_despesa)}.`,
      };
    }
    return {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      title: "Orçamento Próximo do Limite",
      badgeVariant: "warning",
      badgeText: `${percentual.toFixed(0)}%`,
      textColor: "text-amber-400",
      message: `Você já utilizou ${formatCurrency(alert.realizado_despesa)} de ${formatCurrency(alert.meta_despesa)}.`,
    };
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <Card className="glass-effect border-amber-500/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <span>Alertas de Orçamento</span>
          </CardTitle>
          <CardDescription>
            Fique de olho nas categorias que exigem sua atenção este mês.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {alerts.map(alert => {
              const details = getAlertDetails(alert);
              if (!details) return null;

              return (
                <li key={alert.categoria_id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {details.icon}
                      <div>
                        <p className="font-bold">{alert.categoria_nome}</p>
                        <p className={`text-sm ${details.textColor}`}>{details.title}</p>
                      </div>
                    </div>
                    <Badge variant={details.badgeVariant}>
                      {details.badgeText}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 pl-8">{details.message}</p>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex justify-end">
            <Button asChild variant="link">
              <Link to="/planejamento-orcamentario">Ver planejamento completo &rarr;</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OrcamentoAlertCard;