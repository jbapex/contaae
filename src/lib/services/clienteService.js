import { supabase } from '@/lib/customSupabaseClient';
import { getUserId } from './api';
import { contasReceberService } from './contasReceberService';
import { getDate, parseISO } from 'date-fns';

export const clienteService = {
  getClientes: async () => {
    const { data, error } = await supabase.from('clientes').select('*, etapa:etapa_id (nome)');
    if (error) {
      console.error("Erro ao buscar clientes:", error);
      return [];
    }
    return data.map(c => ({...c, etapa_nome: c.etapa?.nome || 'Sem Etapa'}));
  },

  updateCliente: async (id, updates) => {
    const { data, error } = await supabase.from('clientes').update(updates).eq('id', id).select('*, etapa:etapa_id(nome)').single();
    if (error) throw error;
    return {...data, etapa_nome: data.etapa?.nome || 'Sem Etapa'};
  },

  createCliente: async (clienteData) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");
    
    const { data: defaultEtapa, error: etapaError } = await supabase.from('etapas').select('id').eq('user_id', userId).order('ordem').limit(1).single();
    if (etapaError && etapaError.code !== 'PGRST116') { // Ignore "no rows found"
        throw etapaError;
    }

    const { isRecorrente, valorMensal, dataInicio, ...rest } = clienteData;

    const payload = {
      ...rest,
      user_id: userId,
      etapa_id: defaultEtapa?.id || null,
      is_recorrente: isRecorrente,
    };
    
    const { data: savedCliente, error } = await supabase.from('clientes').insert(payload).select().single();
    
    if (error) {
      if (error.code === '23505') {
        throw new Error("Cliente com este nome já existe.");
      }
      throw error;
    }

    if (savedCliente && isRecorrente) {
      await clienteService.setupRecorrencia(savedCliente.id, valorMensal, dataInicio);
    }

    return savedCliente;
  },

  setupRecorrencia: async (clienteId, valorMensal, dataInicio, numeroMeses = 12) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    if (!dataInicio) {
        throw new Error("Data de início da recorrência é obrigatória.");
    }
    const diaVencimento = getDate(parseISO(dataInicio));

    const { data: recorrencia, error: upsertError } = await supabase
      .from('clientes_recorrentes')
      .upsert({
        user_id: userId,
        cliente_id: clienteId,
        valor_mensal: valorMensal,
        dia_vencimento: diaVencimento,
        ativo: true,
      }, { onConflict: 'user_id, cliente_id' })
      .select()
      .single();

    if (upsertError) throw upsertError;

    await supabase.from('clientes').update({ is_recorrente: true }).eq('id', clienteId);

    const { data: cliente } = await supabase.from('clientes').select('nome').eq('id', clienteId).single();

    await contasReceberService.createVendaParcelada({
      cliente: cliente.nome,
      valor: valorMensal * numeroMeses,
      numero_parcelas: numeroMeses,
      data: dataInicio,
      descricao: `Plano Recorrente - ${cliente.nome}`
    });

    return recorrencia;
  },

  deleteCliente: async (clienteId) => {
    await supabase.from('clientes_recorrentes').delete().eq('cliente_id', clienteId);
    const { error } = await supabase.from('clientes').delete().eq('id', clienteId);
    if (error) throw error;
  },

  findClienteId: async (nome, createIfNotFound = false, clienteData = {}) => {
    if (!nome || nome === 'none' || nome === 'Nenhum' || typeof nome !== 'string' || nome.trim() === '') return null;
    const userId = await getUserId();
    if (!userId) return null;

    const { data, error } = await supabase.from('clientes').select('id').match({ nome: nome.trim(), user_id: userId }).maybeSingle();
    
    if (error) {
        console.error('Erro ao buscar cliente ID:', error);
    }
    if (data) return data.id;

    if (createIfNotFound) {
      const fullClientData = { nome: nome.trim(), ...clienteData };
      try {
        const newData = await clienteService.createCliente(fullClientData);
        return newData.id;
      } catch (newError) {
        if (newError.message.includes("já existe")) {
            const { data: existing } = await supabase.from('clientes').select('id').match({ nome: nome.trim(), user_id: userId }).single();
            return existing.id;
        }
        console.error("Erro ao criar novo cliente:", newError);
        return null;
      }
    }
    
    return null;
  },
};