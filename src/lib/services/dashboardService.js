import { supabase } from '@/lib/customSupabaseClient';
    import { subMonths, format, startOfDay, endOfDay } from 'date-fns';
    import { ptBR } from 'date-fns/locale';

    export const dashboardService = {
      getDashboardData: async (dateRange) => {
        const { from, to } = dateRange;
        const startDate = from ? format(startOfDay(from), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") : null;
        const endDate = to ? format(endOfDay(to), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") : null;

        if (!startDate || !endDate) {
          throw new Error('Intervalo de datas inválido');
        }

        let lancamentosQuery = supabase
          .from('lancamentos')
          .select('*')
          .gte('data', startDate)
          .lte('data', endDate);

        const [
          { data: lancamentos, error: lancamentosError },
          { data: clientes, error: clientesError },
          { data: recorrentes, error: recorrentesError },
          { data: orcamentoCompleto, error: orcamentoError },
          { data: contasReceber, error: contasReceberError },
          { data: contasPagar, error: contasPagarError },
        ] = await Promise.all([
          lancamentosQuery,
          supabase.from('clientes').select('*'),
          supabase.from('contas_a_pagar_instancias').select('*').gte('data_vencimento', startDate).lte('data_vencimento', endDate),
          supabase.from('orcamento_mensal').select(`*, categoria:categoria_id(id, nome, tipo)`).gte('mes', format(from, 'yyyy-MM-01')).lte('mes', format(to, 'yyyy-MM-01')),
          supabase.from('contas_receber').select('*').eq('status', 'pendente').lte('data_vencimento', endDate),
          supabase.from('contas_a_pagar').select('*').eq('status', 'pendente').gte('data_vencimento', startDate).lte('data_vencimento', endDate),
        ]);
        
        if (lancamentosError) throw new Error('Falha ao buscar lançamentos: ' + lancamentosError.message);
        if (clientesError) throw new Error('Falha ao buscar clientes: ' + clientesError.message);
        if (recorrentesError) throw new Error('Falha ao buscar recorrências: ' + recorrentesError.message);
        if (orcamentoError) throw new Error('Falha ao buscar orçamento: ' + orcamentoError.message);
        if (contasReceberError) throw new Error('Falha ao buscar contas a receber: ' + contasReceberError.message);
        if (contasPagarError) throw new Error('Falha ao buscar contas a pagar: ' + contasPagarError.message);

        // KPI calculations
        const entradas = lancamentos.filter(l => l.tipo === 'entrada').reduce((sum, l) => sum + l.valor, 0);
        const saidas = lancamentos.filter(l => l.tipo === 'saida').reduce((sum, l) => sum + l.valor, 0);
        const lucro = entradas - saidas;
        const margem = entradas > 0 ? (lucro / entradas) * 100 : 0;
        
        const kpis = { entradas, saidas, lucro, margem };

        // Top Expenses
        const saidasPorCategoria = lancamentos.filter(l => l.tipo === 'saida').reduce((acc, l) => {
            const categoriaId = l.categoria_id || 'sem_categoria';
            acc[categoriaId] = (acc[categoriaId] || 0) + l.valor;
            return acc;
        }, {});

        const { data: categoriasData } = await supabase.from('categorias').select('id, nome');
        const categoriasMap = new Map(categoriasData.map(c => [c.id, c.nome]));
        categoriasMap.set('sem_categoria', 'Sem Categoria');

        const topExpenses = Object.entries(saidasPorCategoria)
            .map(([id, valor]) => ({ categoria: categoriasMap.get(id) || 'Desconhecida', valor }))
            .sort((a, b) => b.valor - a.valor)
            .slice(0, 3);
            
        // Recurring payments status
        const recorrentesPendentes = recorrentes.filter(r => r.status === 'pendente').length;
        const recorrentesAtrasados = recorrentes.filter(r => r.status === 'atrasado').length;
        const recorrentesStatus = { pendentes: recorrentesPendentes, atrasados: recorrentesAtrasados };

        // Budget Alerts
        const lancamentosPorCategoria = lancamentos.reduce((acc, l) => {
          if (!l.categoria_id) return acc;
          if (!acc[l.categoria_id]) acc[l.categoria_id] = { entrada: 0, saida: 0 };
          acc[l.categoria_id][l.tipo] += l.valor;
          return acc;
        }, {});

        const alerts = orcamentoCompleto.map(orc => {
          const realizado = lancamentosPorCategoria[orc.categoria_id] || { receita: 0, despesa: 0 };
          return {
            ...orc,
            categoria_nome: orc.categoria.nome,
            categoria_tipo: orc.categoria.tipo,
            realizado_receita: realizado.entrada,
            realizado_despesa: realizado.saida,
          };
        }).filter(item => 
          item.categoria_tipo === 'saida' && 
          item.meta_despesa > 0 && 
          item.realizado_despesa / item.meta_despesa >= 0.8
        ).sort((a, b) => (b.realizado_despesa / b.meta_despesa) - (a.realizado_despesa / a.meta_despesa));


        return {
          kpis,
          topExpenses,
          totalClientes: clientes.length,
          totalLancamentos: lancamentos.length,
          recorrentesStatus,
          orcamentoAlerts: alerts,
          contasReceber,
          contasPagarProximas: contasPagar,
        };
      },
    };