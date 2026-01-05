import { supabase } from '@/lib/customSupabaseClient';
import { getUserId } from './api';
import { categoriaService } from './categoriaService';
import { clienteService } from './clienteService';
import { contasReceberService } from './contasReceberService';
import { format, startOfDay, endOfDay } from 'date-fns';

export const lancamentoService = {
  getLancamentos: async (filters = {}) => {
    let query = supabase.from('lancamentos').select(`
      id,
      descricao,
      valor,
      data,
      tipo,
      created_at,
      conta_bancaria_id,
      produto_id,
      categoria:categorias ( id, nome ),
      cliente:clientes ( id, nome, etapa_id ),
      fornecedor:fornecedores ( id, nome ),
      conta_bancaria:contas_bancarias ( id, nome_banco ),
      produto:produtos ( id, nome )
    `).order('data', { ascending: false });

    if (filters.periodo?.from) {
      query = query.gte('data', format(startOfDay(new Date(filters.periodo.from)), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"));
    }
    if (filters.periodo?.to) {
      query = query.lte('data', format(endOfDay(new Date(filters.periodo.to)), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"));
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar lançamentos:", error);
      return [];
    }
    return data.map(l => ({
      ...l,
      categoria: l.categoria?.nome || 'Nenhuma',
      categoria_id: l.categoria?.id || null,
      cliente: l.cliente,
      cliente_id: l.cliente?.id || null,
      clienteNome: l.cliente?.nome || 'Nenhum',
      fornecedorNome: l.fornecedor?.nome || 'Nenhum',
      conta_bancaria_nome: l.conta_bancaria?.nome_banco || 'Nenhuma',
      produto_nome: l.produto?.nome || null,
    }));
  },

  getLancamentosPorConta: async (contaId, dataInicio, dataFim) => {
    const userId = await getUserId();
    if (!userId) return [];

    let query = supabase
      .from('lancamentos')
      .select(`
        id,
        data,
        descricao,
        valor,
        tipo,
        categoria:categorias ( nome )
      `)
      .eq('user_id', userId)
      .eq('conta_bancaria_id', contaId)
      .order('data', { ascending: false });

    if (dataInicio) {
      query = query.gte('data', dataInicio);
    }
    if (dataFim) {
      query = query.lte('data', dataFim);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar lançamentos por conta:", error);
      throw error;
    }
    return data.map(l => ({
      ...l,
      categoria: l.categoria?.nome || 'Nenhuma',
    }));
  },

  saveLancamento: async (lancamento) => {
    if (lancamento.tipo === 'crediario') {
      return contasReceberService.createVendaParcelada(lancamento);
    }

    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const { id, categoria, cliente, fornecedor_id, ...rest } = lancamento;
    
    let categoria_id = null;
    if (categoria && categoria.trim() !== '') {
        categoria_id = await categoriaService.findCategoriaId(categoria, rest.tipo, true);
    }

    let cliente_id = null;
    if(cliente && cliente.trim() !== '') {
        cliente_id = await clienteService.findClienteId(cliente, true);
    }
    
    const payload = { ...rest, user_id: userId, categoria_id, cliente_id, fornecedor_id };
    
    delete payload.id;
    delete payload.numero_parcelas;

    // Ensure empty strings are converted to null for UUID fields
    if (payload.cliente_id === '') payload.cliente_id = null;
    if (payload.categoria_id === '') payload.categoria_id = null;
    if (payload.conta_bancaria_id === '') payload.conta_bancaria_id = null;
    if (payload.fornecedor_id === '') payload.fornecedor_id = null;
    if (payload.produto_id === '') payload.produto_id = null;

    const { data, error } = await supabase.from('lancamentos').insert([payload]).select().single();
    if (error) throw error;
    return data;
  },

  updateLancamento: async (id, updates) => {
    const payload = {
      descricao: updates.descricao,
      valor: parseFloat(updates.valor),
      data: updates.data,
      tipo: updates.tipo,
      conta_bancaria_id: updates.conta_bancaria_id || null,
      produto_id: updates.produto_id || null,
    };

    payload.categoria_id = await categoriaService.findCategoriaId(updates.categoria, updates.tipo, true);
    payload.cliente_id = await clienteService.findClienteId(updates.cliente, true);

    // Ensure empty strings are converted to null for UUID fields
    if (payload.cliente_id === '') payload.cliente_id = null;
    if (payload.categoria_id === '') payload.categoria_id = null;
    if (payload.conta_bancaria_id === '') payload.conta_bancaria_id = null;
    if (payload.produto_id === '') payload.produto_id = null;


    const { data, error } = await supabase
      .from('lancamentos')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating lancamento:", error);
      throw error;
    }
    return data;
  },

  deleteLancamento: async (id) => {
    const { error } = await supabase.from('lancamentos').delete().eq('id', id);
    if (error) throw error;
  },

  importLancamentosMassa: async (csvData, mapping) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const parseDate = (dateString) => {
      if (!dateString) return null;
      let parsedDate;
      if (/\d{4}-\d{2}-\d{2}/.test(dateString)) {
          parsedDate = new Date(dateString + 'T00:00:00');
      } else if (/\d{2}\/\d{2}\/\d{4}/.test(dateString)) {
          const [dia, mes, ano] = dateString.split('/');
          parsedDate = new Date(`${ano}-${mes}-${dia}T00:00:00`);
      } else {
          parsedDate = new Date(dateString);
      }
      return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
    };

    const parseValue = (valueString) => {
      if (!valueString) return 0;
      const cleanedString = String(valueString).replace(/[^\d,-]/g, '').replace(',', '.');
      return parseFloat(cleanedString) || 0;
    };
    
    let successCount = 0;
    let errorCount = 0;
    const lancamentosParaInserir = [];

    for (const row of csvData) {
      try {
        const tipo = String(row[mapping.tipo]).toLowerCase().trim();
        if (tipo !== 'entrada' && tipo !== 'saida') {
          console.warn('Linha ignorada: tipo inválido', row);
          errorCount++;
          continue;
        }

        const data = parseDate(row[mapping.data]);
        if (!data) {
          console.warn('Linha ignorada: data inválida', row);
          errorCount++;
          continue;
        }

        const valor = parseValue(row[mapping.valor]);
        if (valor === 0 && row[mapping.valor] !== '0') {
           console.warn('Linha ignorada: valor inválido', row);
           errorCount++;
           continue;
        }

        const descricao = row[mapping.descricao] || 'Sem descrição';
        
        let categoria_id = null;
        if (mapping.categoria && row[mapping.categoria]) {
            categoria_id = await categoriaService.findCategoriaId(row[mapping.categoria], tipo, true);
        }

        let cliente_id = null;
        if (mapping.cliente && row[mapping.cliente]) {
            cliente_id = await clienteService.findClienteId(row[mapping.cliente], true);
        }

        lancamentosParaInserir.push({
          user_id: userId,
          data,
          descricao,
          valor,
          tipo,
          categoria_id,
          cliente_id
        });
        
      } catch (e) {
        console.error('Erro ao processar linha:', e, row);
        errorCount++;
      }
    }

    if (lancamentosParaInserir.length > 0) {
      const { error } = await supabase.from('lancamentos').insert(lancamentosParaInserir);

      if (error) {
        console.error("Erro ao inserir lançamentos em massa:", error);
        throw new Error("Ocorreu um erro ao salvar os dados. Verifique o console para mais detalhes.");
      } else {
        successCount = lancamentosParaInserir.length;
      }
    }

    return { successCount, errorCount };
  }
};