import { lancamentoService } from "../services/lancamentoService";

export const calculations = {
  getMonthlyResults: (lancamentos, month, year) => {
    const monthlyLancamentos = lancamentos.filter(l => {
      const date = new Date(l.data);
      return date.getUTCMonth() === month && date.getUTCFullYear() === year;
    });

    const entradas = monthlyLancamentos
      .filter(l => l.tipo === 'entrada')
      .reduce((sum, l) => sum + parseFloat(l.valor), 0);

    const saidas = monthlyLancamentos
      .filter(l => l.tipo === 'saida')
      .reduce((sum, l) => sum + parseFloat(l.valor), 0);
      
    const entradasPorCategoria = monthlyLancamentos
      .filter(l => l.tipo === 'entrada')
      .reduce((acc, l) => {
          acc[l.categoria] = (acc[l.categoria] || 0) + parseFloat(l.valor);
          return acc;
      }, {});

    const saidasPorCategoria = monthlyLancamentos
        .filter(l => l.tipo === 'saida')
        .reduce((acc, l) => {
            acc[l.categoria] = (acc[l.categoria] || 0) + parseFloat(l.valor);
            return acc;
        }, {});

    const lucro = entradas - saidas;
    const margem = entradas > 0 ? (lucro / entradas) * 100 : 0;

    return {
      entradas,
      saidas,
      lucro,
      margem,
      entradasPorCategoria,
      saidasPorCategoria,
      lancamentos: monthlyLancamentos
    };
  },

  getYearlyResults: (lancamentos, year) => {
    const results = [];
    for (let month = 0; month < 12; month++) {
      results.push(calculations.getMonthlyResults(lancamentos, month, year));
    }
    return results;
  },

  getClientResults: (lancamentos, clienteId) => {
    const clienteLancamentos = lancamentos.filter(l => l.cliente?.id === clienteId);
    
    const entradas = clienteLancamentos
      .filter(l => l.tipo === 'entrada')
      .reduce((sum, l) => sum + parseFloat(l.valor), 0);

    const saidas = clienteLancamentos
      .filter(l => l.tipo === 'saida')
      .reduce((sum, l) => sum + parseFloat(l.valor), 0);

    return {
      entradas,
      saidas,
      lucro: entradas - saidas,
      lancamentos: clienteLancamentos
    };
  },

  getResultsForLancamentos: (lancamentos) => {
    if (!lancamentos || lancamentos.length === 0) {
      return { entradas: 0, saidas: 0, lucro: 0 };
    }
    
    const entradas = lancamentos
      .filter(l => l.tipo === 'entrada')
      .reduce((sum, l) => sum + parseFloat(l.valor), 0);

    const saidas = lancamentos
      .filter(l => l.tipo === 'saida')
      .reduce((sum, l) => sum + parseFloat(l.valor), 0);

    const lucro = entradas - saidas;

    return { entradas, saidas, lucro };
  }
};