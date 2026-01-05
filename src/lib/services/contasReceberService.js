import { supabase } from '@/lib/customSupabaseClient';
import { getUserId } from './api';
import { categoriaService } from './categoriaService';
import { clienteService } from './clienteService';
import { addMonths, format, getDate, parseISO } from 'date-fns';

export const contasReceberService = {
  getContasReceber: async () => {
    const { data, error } = await supabase
      .from('contas_receber')
      .select(`
        *,
        cliente:cliente_id ( id, nome, telefone ),
        categoria:categoria_id ( id, nome )
      `)
      .order('data_vencimento', { ascending: true });

    if (error) {
      console.error("Erro ao buscar contas a receber:", error);
      throw error;
    }

    return data.map(item => ({
      ...item,
      cliente_nome: item.cliente?.nome || 'N/A',
      cliente_telefone: item.cliente?.telefone,
      categoria_nome: item.categoria?.nome || 'N/A',
    }));
  },

  createVendaParcelada: async (vendaData) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const {
      valor,
      descricao,
      data,
      categoria_id,
      cliente_id,
      numero_parcelas
    } = vendaData;

    const resolved_cliente_id = cliente_id || await clienteService.findClienteId(vendaData.cliente, true);
    if (!resolved_cliente_id) throw new Error("Cliente não encontrado ou não pôde ser criado.");

    const resolved_categoria_id = categoria_id || await categoriaService.findCategoriaId(vendaData.categoria || 'Vendas', 'entrada', true);

    const valor_parcela = parseFloat(valor) / parseInt(numero_parcelas, 10);
    const data_primeira_parcela = new Date(data + 'T00:00:00');
    const venda_id = crypto.randomUUID();

    const parcelas = [];
    for (let i = 0; i < numero_parcelas; i++) {
      const data_vencimento = addMonths(data_primeira_parcela, i);
      parcelas.push({
        user_id: userId,
        cliente_id: resolved_cliente_id,
        categoria_id: resolved_categoria_id,
        venda_id,
        descricao: `${descricao} (${i + 1}/${numero_parcelas})`,
        valor_parcela,
        numero_parcela: i + 1,
        total_parcelas: parseInt(numero_parcelas, 10),
        data_vencimento: format(data_vencimento, 'yyyy-MM-dd'),
        status: 'pendente',
      });
    }

    const { data: insertedData, error } = await supabase
      .from('contas_receber')
      .insert(parcelas)
      .select();

    if (error) {
      console.error("Erro ao criar venda parcelada:", error);
      throw error;
    }

    return insertedData;
  },

  ativarRecorrencia: async (recorrenciaData) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");
  
    const { clienteId, valor, numero_parcelas, data } = recorrenciaData;
    
    const diaVencimento = getDate(parseISO(data));

    const { error: recorrenciaError } = await supabase
      .from('clientes_recorrentes')
      .upsert({
        user_id: userId,
        cliente_id: clienteId,
        valor_mensal: valor,
        dia_vencimento: diaVencimento,
        ativo: true,
      }, { onConflict: 'user_id, cliente_id' });

    if (recorrenciaError) {
      console.error("Erro ao salvar dados de recorrência:", recorrenciaError);
      throw new Error("Não foi possível salvar os detalhes da recorrência.");
    }

    const { data: cliente } = await supabase.from('clientes').select('nome').eq('id', clienteId).single();

    return await contasReceberService.createVendaParcelada({
      ...recorrenciaData,
      cliente: cliente.nome,
      descricao: `Plano Recorrente - ${cliente.nome}`
    });
  },

  marcarComoPaga: async (pagamentoInfo) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const { contaId, valorPago, dataPagamento, diferenca, acaoDiferenca, vendaId, parcelaAtual, contaBancariaId } = pagamentoInfo;

    const { data: contaOriginal, error: fetchError } = await supabase
      .from('contas_receber')
      .select('valor_parcela')
      .eq('id', contaId)
      .single();

    if(fetchError) {
        console.error("Erro ao buscar valor original da parcela:", fetchError);
        throw new Error("Não foi possível encontrar a parcela original.");
    }

    const { data: conta, error: updateError } = await supabase
      .from('contas_receber')
      .update({ 
        status: 'pago', 
        data_pagamento: dataPagamento,
        valor_parcela: valorPago,
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

    const lancamentoPayload = {
      user_id: userId,
      descricao: conta.descricao,
      valor: valorPago,
      data: dataPagamento,
      tipo: 'entrada',
      categoria_id: conta.categoria_id,
      cliente_id: conta.cliente_id,
      conta_bancaria_id: contaBancariaId,
    };

    const { error: lancamentoError } = await supabase
      .from('lancamentos')
      .insert(lancamentoPayload);

    if (lancamentoError) {
      await supabase
        .from('contas_receber')
        .update({ status: 'pendente', data_pagamento: null, valor_pago_efetivo: null, valor_parcela: contaOriginal.valor_parcela, conta_bancaria_id: null })
        .eq('id', contaId);
      console.error("Erro ao criar lançamento correspondente:", lancamentoError);
      throw new Error("Falha ao criar o lançamento financeiro. A baixa da parcela foi revertida.");
    }

    if (diferenca !== 0) {
      const { data: proximasParcelas, error: parcelasError } = await supabase
        .from('contas_receber')
        .select('*')
        .eq('venda_id', vendaId)
        .eq('status', 'pendente')
        .gt('numero_parcela', parcelaAtual)
        .order('numero_parcela');

      if (parcelasError) {
        console.error("Erro ao buscar próximas parcelas:", parcelasError);
        throw new Error("Pagamento registrado, mas houve um erro ao ajustar as próximas parcelas.");
      }

      if (proximasParcelas && proximasParcelas.length > 0) {
        if (acaoDiferenca === 'distribuir') {
          const valorPorParcela = diferenca / proximasParcelas.length;
          for (const p of proximasParcelas) {
            await supabase
              .from('contas_receber')
              .update({ valor_parcela: Number(p.valor_parcela) - valorPorParcela })
              .eq('id', p.id);
          }
        } else {
          const proxima = proximasParcelas[0];
          await supabase
            .from('contas_receber')
            .update({ valor_parcela: Number(proxima.valor_parcela) - diferenca })
            .eq('id', proxima.id);
        }
      } else if (diferenca < 0) {
        await supabase.from('lancamentos').insert({
            user_id: userId,
            descricao: `Perda no pagamento final da venda ${conta.descricao}`,
            valor: Math.abs(diferenca),
            data: dataPagamento,
            tipo: 'saida',
            conta_bancaria_id: contaBancariaId,
        });
      } else if (diferenca > 0) {
         await supabase.from('lancamentos').insert({
            user_id: userId,
            descricao: `Crédito de pagamento da venda ${conta.descricao}`,
            valor: diferenca,
            data: dataPagamento,
            tipo: 'entrada',
            cliente_id: conta.cliente_id,
            conta_bancaria_id: contaBancariaId,
        });
      }
    }


    return conta;
  },

  deleteConta: async (contaId) => {
    const { error } = await supabase
      .from('contas_receber')
      .delete()
      .eq('id', contaId);
    
    if (error) {
      console.error("Erro ao deletar conta a receber:", error);
      throw error;
    }
  },
};