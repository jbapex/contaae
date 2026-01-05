import { supabase } from '@/lib/customSupabaseClient';
import { getUserId } from './api';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

export const dataService = {
  getStats: async () => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const { data: lancamentos, error: lancamentosError } = await supabase
      .from('lancamentos')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    const { data: categorias, error: categoriasError } = await supabase
      .from('categorias')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (lancamentosError || clientesError || categoriasError) {
      console.error("Erro ao buscar estatísticas:", lancamentosError || clientesError || categoriasError);
      throw new Error("Não foi possível buscar as estatísticas.");
    }

    return {
      lancamentos: lancamentos.length,
      clientes: clientes.length,
      categorias: categorias.length,
    };
  },

  clearSelectedData: async (itemsToClear) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const tablesToClear = {
      lancamentos: 'lancamentos',
      clientes: 'clientes',
      categorias: 'categorias',
      fornecedores: 'fornecedores',
      contas_a_pagar: 'contas_a_pagar',
      contas_a_receber: 'contas_receber',
      contas_bancarias: 'contas_bancarias',
      recorrentes: 'contas_a_pagar_recorrentes',
      etapas: 'etapas',
      orcamentos: 'orcamento_mensal',
      estoque: 'produtos', // Inclui produtos e movimentos de estoque
    };

    for (const item of itemsToClear) {
      if (tablesToClear[item]) {
        if (item === 'estoque') {
          // Deletar movimentos primeiro por causa da FK
          const { error: movError } = await supabase.from('movimentos_estoque').delete().eq('user_id', userId);
          if (movError) throw movError;
          const { error: prodError } = await supabase.from('produtos').delete().eq('user_id', userId);
          if (prodError) throw prodError;
        } else {
          const { error } = await supabase.from(tablesToClear[item]).delete().eq('user_id', userId);
          if (error) {
            console.error(`Erro ao limpar a tabela ${tablesToClear[item]}:`, error);
            throw new Error(`Não foi possível limpar os dados de ${item}. Verifique se não há dependências.`);
          }
        }
      }
    }
  },

  exportToCsv: async () => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const { data, error } = await supabase
      .from('lancamentos')
      .select(`
        data,
        descricao,
        valor,
        tipo,
        categoria:categorias ( nome ),
        cliente:clientes ( nome )
      `)
      .eq('user_id', userId)
      .order('data', { ascending: true });

    if (error) {
      console.error("Erro ao buscar dados para exportação:", error);
      throw new Error("Não foi possível buscar os dados para exportação.");
    }

    const formattedData = data.map(item => ({
      Data: new Date(item.data).toLocaleDateString('pt-BR'),
      Descrição: item.descricao,
      Valor: item.valor.toFixed(2).replace('.', ','),
      Tipo: item.tipo,
      Categoria: item.categoria ? item.categoria.nome : '',
      Cliente: item.cliente ? item.cliente.nome : '',
    }));

    const csv = Papa.unparse(formattedData, {
      delimiter: ";",
      header: true,
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `backup_lancamentos_${new Date().toISOString().split('T')[0]}.csv`);
  },
};