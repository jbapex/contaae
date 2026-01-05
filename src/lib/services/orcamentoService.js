import { supabase } from '@/lib/customSupabaseClient';
import { getUserId } from './api';
import { startOfMonth, endOfMonth, formatISO } from 'date-fns';

export const orcamentoService = {
  getOrcamentoMensal: async (date) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const mes = startOfMonth(date);

    const { data, error } = await supabase
      .from('orcamento_mensal')
      .select(`
        id,
        mes,
        meta_receita,
        meta_despesa,
        categoria:categoria_id (id, nome, tipo)
      `)
      .eq('user_id', userId)
      .eq('mes', mes.toISOString().split('T')[0]);

    if (error) {
      console.error("Erro ao buscar orçamento mensal:", error);
      throw error;
    }
    return data;
  },

  getOrcamentoCompleto: async (date) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const inicioMes = startOfMonth(date);
    const fimMes = endOfMonth(date);
    const mesFormatado = inicioMes.toISOString().split('T')[0];
    
    // 1. Buscar todas as categorias do usuário
    const { data: categorias, error: categoriaError } = await supabase
      .from('categorias')
      .select('id, nome, tipo')
      .eq('user_id', userId);
    
    if (categoriaError) {
      console.error("Erro ao buscar categorias:", categoriaError);
      throw categoriaError;
    }

    // 2. Buscar todos os orçamentos salvos para o mês
    const { data: orcamentos, error: orcamentoError } = await supabase
      .from('orcamento_mensal')
      .select('categoria_id, meta_receita, meta_despesa')
      .eq('user_id', userId)
      .eq('mes', mesFormatado);

    if (orcamentoError) {
      console.error("Erro ao buscar orçamentos:", orcamentoError);
      throw orcamentoError;
    }
    
    const orcamentosMap = new Map(orcamentos.map(o => [o.categoria_id, o]));

    // 3. Buscar todos os lançamentos do mês
    const { data: lancamentos, error: lancamentoError } = await supabase
      .from('lancamentos')
      .select('valor, tipo, categoria_id')
      .eq('user_id', userId)
      .gte('data', formatISO(inicioMes))
      .lte('data', formatISO(fimMes));

    if (lancamentoError) {
      console.error("Erro ao buscar lançamentos:", lancamentoError);
      throw lancamentoError;
    }
    
    // 4. Calcular os totais realizados por categoria
    const realizadosMap = new Map();
    for (const l of lancamentos) {
        if (!l.categoria_id) continue;
        
        if (!realizadosMap.has(l.categoria_id)) {
            realizadosMap.set(l.categoria_id, { receita: 0, despesa: 0 });
        }
        
        const current = realizadosMap.get(l.categoria_id);
        if (l.tipo === 'entrada') {
            current.receita += l.valor;
        } else if (l.tipo === 'saida') {
            current.despesa += l.valor;
        }
    }

    // 5. Combinar todos os dados
    const dadosCombinados = categorias.map(cat => {
        const orcamento = orcamentosMap.get(cat.id) || {};
        const realizado = realizadosMap.get(cat.id) || { receita: 0, despesa: 0 };

        return {
            categoria_id: cat.id,
            categoria_nome: cat.nome,
            categoria_tipo: cat.tipo,
            meta_receita: orcamento.meta_receita || 0,
            realizado_receita: realizado.receita,
            meta_despesa: orcamento.meta_despesa || 0,
            realizado_despesa: realizado.despesa,
        };
    });
    
    return dadosCombinados;
  },
  
  saveOrcamento: async (orcamentos, date) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const mes = startOfMonth(date).toISOString().split('T')[0];

    const upsertData = orcamentos
      .filter(o => (o.meta_receita || 0) > 0 || (o.meta_despesa || 0) > 0)
      .map(o => ({
        user_id: userId,
        mes: mes,
        categoria_id: o.categoria_id,
        meta_receita: o.meta_receita || 0,
        meta_despesa: o.meta_despesa || 0,
      }));

    if (upsertData.length === 0) {
      // Se não houver dados para salvar, podemos apenas retornar com sucesso.
      return [];
    }
    
    const { data, error } = await supabase
      .from('orcamento_mensal')
      .upsert(upsertData, { onConflict: 'user_id,mes,categoria_id' });

    if (error) {
      console.error("Erro ao salvar orçamento:", error);
      throw error;
    }

    return data;
  },
};