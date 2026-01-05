import { supabase } from '@/lib/customSupabaseClient';
import { getUserId } from './api';

export const pagamentoRecorrenteService = {
  getPagamentosRecorrentes: async () => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const { data, error } = await supabase
      .from('contas_a_pagar_recorrentes')
      .select(`
        *,
        categoria:categoria_id(nome),
        fornecedor:fornecedor_id(nome)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro ao buscar pagamentos recorrentes:", error);
      throw error;
    }
    
    return data.map(p => ({
        ...p,
        categoria_nome: p.categoria?.nome || 'N/A',
        fornecedor_nome: p.fornecedor?.nome || 'N/A'
    }));
  },

  savePagamentoRecorrente: async (pagamentoData) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const payload = {
      ...pagamentoData,
      user_id: userId,
    };

    if (payload.id) {
      const { id, categoria_nome, fornecedor_nome, ...updateData } = payload;
      delete updateData.categoria;
      delete updateData.fornecedor;
      const { data, error } = await supabase
        .from('contas_a_pagar_recorrentes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      delete payload.id;
      const { data, error } = await supabase
        .from('contas_a_pagar_recorrentes')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  deletePagamentoRecorrente: async (id) => {
    await supabase
      .from('contas_a_pagar_instancias')
      .delete()
      .eq('conta_recorrente_id', id);

    const { error } = await supabase
      .from('contas_a_pagar_recorrentes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao deletar pagamento recorrente:", error);
      throw error;
    }
    return true;
  },

  getInstanciasDoMes: async (ano, mes) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const primeiroDia = new Date(ano, mes, 1).toISOString();
    const ultimoDia = new Date(ano, mes + 1, 0).toISOString();

    const { data, error } = await supabase
      .from('contas_a_pagar_instancias')
      .select(`
        *,
        conta_recorrente:conta_recorrente_id(nome, categoria:categoria_id(nome))
      `)
      .eq('user_id', userId)
      .gte('data_vencimento', primeiroDia)
      .lte('data_vencimento', ultimoDia)
      .order('data_vencimento', { ascending: true });

    if (error) {
      console.error("Erro ao buscar instâncias de pagamento:", error);
      throw error;
    }
    
    return data.map(i => ({
      ...i,
      nome: i.conta_recorrente.nome,
      categoria_nome: i.conta_recorrente.categoria.nome,
    }));
  },

  marcarComoPago: async (instanciaId) => {
    const { data, error } = await supabase
      .from('contas_a_pagar_instancias')
      .update({ status: 'pago', data_pagamento: new Date().toISOString() })
      .eq('id', instanciaId)
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao marcar como pago:", error);
      throw error;
    }
    return data;
  },

  gerarInstanciasFaltantes: async () => {
    const { data, error } = await supabase.functions.invoke('check-recorrentes');
    if (error) {
      console.error("Erro ao gerar instâncias:", error);
      throw error;
    }
    return data;
  }
};