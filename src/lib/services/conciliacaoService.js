import { supabase } from '@/lib/customSupabaseClient';
import { getUserId } from './api';
import { format, subDays, addDays } from 'date-fns';

export const conciliacaoService = {
  uploadExtrato: async (transacoes, mapping, contaBancariaId) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    if (!mapping.data || !mapping.descricao || (!mapping.valor && !mapping.entrada && !mapping.saida)) {
      throw new Error("Mapeamento de colunas incompleto. Data, Descrição e Valor (ou Entradas/Saídas) são obrigatórios.");
    }

    const parsedTransacoes = transacoes.map(item => {
      const dataValue = item[mapping.data];
      const descricaoValue = item[mapping.descricao];
      
      let valor = 0;
      let tipo = '';

      if (mapping.valor) {
        const valorRaw = item[mapping.valor] || '0';
        const valorNumerico = parseFloat(String(valorRaw).replace(/[^\d,-]/g, '').replace(',', '.'));
        if (isNaN(valorNumerico)) return null;
        valor = Math.abs(valorNumerico);
        tipo = valorNumerico >= 0 ? 'entrada' : 'saida';
      } else {
        const entradaRaw = item[mapping.entrada] || '0';
        const saidaRaw = item[mapping.saida] || '0';
        const valorEntrada = parseFloat(String(entradaRaw).replace(/[^\d,-]/g, '').replace(',', '.'));
        const valorSaida = parseFloat(String(saidaRaw).replace(/[^\d,-]/g, '').replace(',', '.'));

        if (!isNaN(valorEntrada) && valorEntrada > 0) {
          valor = valorEntrada;
          tipo = 'entrada';
        } else if (!isNaN(valorSaida) && valorSaida > 0) {
          valor = valorSaida;
          tipo = 'saida';
        } else {
          return null; // Nenhuma transação válida
        }
      }

      if (!dataValue || !descricaoValue) return null;

      // Tenta analisar diferentes formatos de data
      let dataFormatada;
      if (/\d{4}-\d{2}-\d{2}/.test(dataValue)) { // YYYY-MM-DD
        dataFormatada = new Date(dataValue + 'T00:00:00');
      } else if (/\d{2}\/\d{2}\/\d{4}/.test(dataValue)) { // DD/MM/YYYY
        const [dia, mes, ano] = dataValue.split('/');
        dataFormatada = new Date(`${ano}-${mes}-${dia}T00:00:00`);
      } else {
        dataFormatada = new Date(dataValue);
      }
      
      if (isNaN(dataFormatada.getTime())) return null;

      return {
        user_id: userId,
        conta_bancaria_id: contaBancariaId,
        data: format(dataFormatada, 'yyyy-MM-dd'),
        descricao: String(descricaoValue),
        valor,
        tipo,
        status: 'pendente'
      };
    }).filter(Boolean);

    if (parsedTransacoes.length === 0) {
      throw new Error("Nenhuma transação válida encontrada no arquivo com o mapeamento fornecido.");
    }
    
    const { error } = await supabase.from('transacoes_extrato').insert(parsedTransacoes);
    if (error) throw error;
  },

  getTransacoesExtratoPendentes: async (contaBancariaId) => {
    let query = supabase
      .from('transacoes_extrato')
      .select('*')
      .eq('status', 'pendente');
    
    if (contaBancariaId) {
      query = query.eq('conta_bancaria_id', contaBancariaId);
    } else {
      query = query.is('conta_bancaria_id', null);
    }
    
    query = query.order('data', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  getSugestoesConciliacao: async (transacoes) => {
    const { data, error } = await supabase.functions.invoke('get-sugestoes-conciliacao', {
        body: { transacoes }
    });
    if (error) throw new Error(`Falha ao buscar sugestões: ${error.message}`);
    return data;
  },

  getLancamentosParaConciliacao: async (transacao) => {
    const dataObj = new Date(transacao.data + 'T00:00:00');
    const dataInicio = format(subDays(dataObj, 5), 'yyyy-MM-dd');
    const dataFim = format(addDays(dataObj, 5), 'yyyy-MM-dd');

    const { data: lancamentos, error } = await supabase
      .from('lancamentos')
      .select('*')
      .eq('conta_bancaria_id', transacao.conta_bancaria_id)
      .gte('data', dataInicio)
      .lte('data', dataFim)
      .eq('tipo', transacao.tipo)
      .is('conciliado_em', null)
      .order('data', { ascending: false });

    if (error) throw error;
    
    const lancamentosFiltrados = lancamentos.filter(l => {
      const diff = Math.abs(l.valor - transacao.valor);
      return diff <= 0.01; // Tolerância para pequenas diferenças de float
    });

    return lancamentosFiltrados;
  },
  
  conciliarTransacao: async (transacaoId, lancamentoId) => {
    const { data: transacao, error: transacaoError } = await supabase
        .from('transacoes_extrato')
        .update({ status: 'conciliado', lancamento_id: lancamentoId })
        .eq('id', transacaoId)
        .select()
        .single();
    
    if (transacaoError) throw transacaoError;

    await supabase
        .from('lancamentos')
        .update({ conciliado_em: new Date().toISOString() })
        .eq('id', lancamentoId);
        
    return transacao;
  },

  ignorarTransacao: async (transacaoId) => {
      const { data, error } = await supabase
        .from('transacoes_extrato')
        .update({ status: 'ignorado' })
        .eq('id', transacaoId)
        .select()
        .single();
    if (error) throw error;
    return data;
  }
};