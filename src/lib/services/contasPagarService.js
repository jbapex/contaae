import { supabase } from '@/lib/customSupabaseClient';
import { getUserId } from './api';
import { categoriaService } from './categoriaService';
import { format, addMonths, parseISO, getMonth } from 'date-fns';

export const contasPagarService = {
  getContasPagar: async () => {
    const { data, error } = await supabase
      .from('contas_a_pagar')
      .select(`
        *,
        fornecedor:fornecedor_id ( id, nome ),
        categoria:categoria_id ( id, nome )
      `)
      .order('data_vencimento', { ascending: true });

    if (error) {
      console.error("Erro ao buscar contas a pagar:", error);
      throw error;
    }

    return data.map(item => ({
      ...item,
      fornecedor_nome: item.fornecedor?.nome || 'N/A',
      categoria_nome: item.categoria?.nome || 'N/A',
    }));
  },

  createContaPagar: async (contaData) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const {
      valor,
      descricao,
      data_vencimento,
      categoria_id,
      fornecedor_id,
      is_recorrente,
    } = contaData;

    const resolved_categoria_id = categoria_id || await categoriaService.findCategoriaId(contaData.categoria || 'Outras Despesas', 'saida', true);

    const compra_id = crypto.randomUUID();

    const novaConta = {
      user_id: userId,
      fornecedor_id: fornecedor_id || null,
      categoria_id: resolved_categoria_id,
      compra_id,
      descricao,
      valor_parcela: valor,
      numero_parcela: 1,
      total_parcelas: 1,
      data_vencimento: format(new Date(data_vencimento + 'T00:00:00'), 'yyyy-MM-dd'),
      status: 'pendente',
      is_recorrente: is_recorrente || false,
    };

    const { data: insertedData, error } = await supabase
      .from('contas_a_pagar')
      .insert(novaConta)
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar conta a pagar:", error);
      throw error;
    }

    return insertedData;
  },

  marcarComoPaga: async (pagamentoInfo) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const { contaId, valorPago, dataPagamento, contaBancariaId } = pagamentoInfo;

    const { data: conta, error: updateError } = await supabase
      .from('contas_a_pagar')
      .update({ 
        status: 'pago', 
        data_pagamento: dataPagamento,
        valor_pago_efetivo: valorPago,
        conta_bancaria_id: contaBancariaId,
      })
      .eq('id', contaId)
      .select()
      .single();

    if (updateError) {
      console.error("Erro ao marcar conta como paga:", updateError);
      throw updateError;
    }
    
    if (conta.is_recorrente) {
        const dataPagamentoObj = parseISO(dataPagamento);
        const dataVencimentoOriginalObj = parseISO(conta.data_vencimento);

        const proximoVencimento = addMonths(dataVencimentoOriginalObj, 1);
        
        if (getMonth(dataPagamentoObj) !== getMonth(dataVencimentoOriginalObj)) {
            const novaContaAtrasada = {
                ...conta,
                data_vencimento: format(proximoVencimento, 'yyyy-MM-dd'),
                status: 'pendente',
                data_pagamento: null,
                valor_pago_efetivo: null,
            };
            delete novaContaAtrasada.id;
            delete novaContaAtrasada.created_at;
            delete novaContaAtrasada.updated_at;

            await supabase.from('contas_a_pagar').insert(novaContaAtrasada);
        } else {
            const proximaConta = {
                ...conta,
                data_vencimento: format(proximoVencimento, 'yyyy-MM-dd'),
                status: 'pendente',
                data_pagamento: null,
                valor_pago_efetivo: null,
            };
            delete proximaConta.id;
            delete proximaConta.created_at;
            delete proximaConta.updated_at;
    
            await supabase.from('contas_a_pagar').insert(proximaConta);
        }
    }

    const lancamentoPayload = {
      user_id: userId,
      descricao: conta.descricao,
      valor: valorPago,
      data: dataPagamento,
      tipo: 'saida',
      categoria_id: conta.categoria_id,
      fornecedor_id: conta.fornecedor_id,
      conta_bancaria_id: contaBancariaId,
    };

    const { error: lancamentoError } = await supabase
      .from('lancamentos')
      .insert(lancamentoPayload);

    if (lancamentoError) {
      await supabase
        .from('contas_a_pagar')
        .update({ status: 'pendente', data_pagamento: null, valor_pago_efetivo: null, conta_bancaria_id: null })
        .eq('id', contaId);
      console.error("Erro ao criar lançamento correspondente:", lancamentoError);
      throw new Error("Falha ao criar o lançamento financeiro. A baixa da conta foi revertida.");
    }

    return conta;
  },

  deleteConta: async (contaId) => {
    const { error } = await supabase
      .from('contas_a_pagar')
      .delete()
      .eq('id', contaId);
    
    if (error) {
      console.error("Erro ao deletar conta a pagar:", error);
      throw error;
    }
  },
};