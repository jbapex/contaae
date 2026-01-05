import { supabase } from '@/lib/customSupabaseClient';
import { getUserId } from './api';

export const contaBancariaService = {
  getContasBancarias: async () => {
    const userId = await getUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('contas_bancarias')
      .select('*')
      .eq('user_id', userId)
      .order('nome_banco', { ascending: true });

    if (error) {
      console.error("Erro ao buscar contas bancárias:", error);
      throw error;
    }
    return data;
  },

  getContasComSaldos: async () => {
    const contas = await contaBancariaService.getContasBancarias();
    const contasComSaldo = await Promise.all(
      contas.map(async (conta) => {
        const { data: saldoCalculado, error } = await supabase.rpc('get_saldo_conta_bancaria', { p_conta_id: conta.id });
        if (error) {
          console.error(`Erro ao calcular saldo para conta ${conta.id}:`, error);
          return { ...conta, saldo_calculado: null, diferenca: null };
        }
        const saldoReal = conta.saldo_inicial;
        return {
          ...conta,
          saldo_calculado: saldoCalculado,
          diferenca: saldoReal - saldoCalculado
        };
      })
    );
    return contasComSaldo;
  },

  saveContaBancaria: async (contaData) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const payload = {
      ...contaData,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    
    payload.saldo_inicial = Number(payload.saldo_inicial) || 0;

    let response;
    if (payload.id) {
      const { id, ...updateData } = payload;
      response = await supabase
        .from('contas_bancarias')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
    } else {
      delete payload.id;
      response = await supabase
        .from('contas_bancarias')
        .insert(payload)
        .select()
        .single();
    }

    const { data, error } = response;
    if (error) {
      console.error("Erro ao salvar conta bancária:", error);
      throw error;
    }
    return data;
  },

  deleteContaBancaria: async (id) => {
    const { error } = await supabase
      .from('contas_bancarias')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao deletar conta bancária:", error);
      throw error;
    }
  },

  transferirEntreContas: async ({ contaOrigemId, contaDestinoId, valor, data }) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const { data: contaOrigem } = await supabase.from('contas_bancarias').select('nome_banco').eq('id', contaOrigemId).single();
    const { data: contaDestino } = await supabase.from('contas_bancarias').select('nome_banco').eq('id', contaDestinoId).single();

    const lancamentos = [
      {
        user_id: userId,
        conta_bancaria_id: contaOrigemId,
        descricao: `Transferência para ${contaDestino.nome_banco}`,
        valor,
        data,
        tipo: 'saida',
      },
      {
        user_id: userId,
        conta_bancaria_id: contaDestinoId,
        descricao: `Transferência de ${contaOrigem.nome_banco}`,
        valor,
        data,
        tipo: 'entrada',
      }
    ];

    const { error } = await supabase.from('lancamentos').insert(lancamentos);
    if (error) {
      console.error("Erro ao criar lançamentos de transferência:", error);
      throw new Error("Falha ao registrar a transferência.");
    }
  }
};