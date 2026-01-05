import React, { useState, useEffect, useCallback } from 'react';
import { estoqueService } from '@/lib/services/estoqueService';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const HistoricoMovimentos = ({ produto }) => {
  const [movimentos, setMovimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMovimentos = useCallback(async () => {
    if (!produto) return;
    setLoading(true);
    try {
      const data = await estoqueService.getMovimentos(produto.id);
      setMovimentos(data);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  }, [produto]);

  useEffect(() => {
    loadMovimentos();
  }, [loadMovimentos]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <p className="text-sm font-medium">Produto: <span className="font-normal text-cyan-400">{produto.nome}</span></p>
      {movimentos.length === 0 ? (
        <p className="text-center text-gray-400 py-8">Nenhum movimento registrado para este produto.</p>
      ) : (
        <ul className="divide-y divide-slate-700">
          {movimentos.map((mov) => (
            <li key={mov.id} className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium capitalize flex items-center gap-2">
                    <Badge variant={mov.tipo === 'entrada' ? 'success' : 'destructive'}>{mov.tipo}</Badge>
                    <span>{mov.quantidade} {produto.unidade_medida}</span>
                  </p>
                  <p className="text-sm text-gray-400">{mov.observacao || 'Sem observação'}</p>
                </div>
                <p className="text-xs text-gray-500">{formatDate(mov.data_movimento)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoricoMovimentos;