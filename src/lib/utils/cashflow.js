import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  isWithinInterval,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

const groupLancamentos = (lancamentos, startDate, endDate, groupBy) => {
  const filteredLancamentos = lancamentos.filter(l => 
    isWithinInterval(new Date(l.data), { start: startDate, end: endDate })
  );

  let interval;
  let getIntervalKey;

  switch (groupBy) {
    case 'day':
      interval = eachDayOfInterval({ start: startDate, end: endDate });
      getIntervalKey = (date) => format(date, 'yyyy-MM-dd');
      break;
    case 'week':
      interval = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
      getIntervalKey = (date) => format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      break;
    case 'month':
      interval = eachMonthOfInterval({ start: startDate, end: endDate });
      getIntervalKey = (date) => format(date, 'yyyy-MM');
      break;
    default:
      throw new Error('Invalid groupBy parameter');
  }

  const grouped = interval.reduce((acc, date) => {
    const key = getIntervalKey(date);
    acc[key] = {
      date: date,
      entradas: 0,
      saidas: 0,
      saldo: 0,
      saldoAcumulado: 0,
    };
    return acc;
  }, {});

  filteredLancamentos.forEach(l => {
    const date = new Date(l.data);
    const key = getIntervalKey(date);
    if (grouped[key]) {
      if (l.tipo === 'entrada') {
        grouped[key].entradas += parseFloat(l.valor);
      } else {
        grouped[key].saidas += parseFloat(l.valor);
      }
    }
  });

  let saldoAcumulado = 0;
  const result = Object.values(grouped).map(group => {
    group.saldo = group.entradas - group.saidas;
    saldoAcumulado += group.saldo;
    group.saldoAcumulado = saldoAcumulado;
    return group;
  });

  return result;
};

export const cashflowCalculations = {
  processCashflow: (lancamentos, startDate, endDate) => {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let groupBy = 'day';
    if (diffDays > 90) {
      groupBy = 'month';
    } else if (diffDays > 15) {
      groupBy = 'week';
    }

    const data = groupLancamentos(lancamentos, startDate, endDate, groupBy);

    const totalEntradas = data.reduce((sum, item) => sum + item.entradas, 0);
    const totalSaidas = data.reduce((sum, item) => sum + item.saidas, 0);
    const saldoFinal = totalEntradas - totalSaidas;

    const formattedData = data.map(item => {
      let label;
      if (groupBy === 'day') {
        label = format(item.date, 'dd/MM', { locale: ptBR });
      } else if (groupBy === 'week') {
        label = `Sem ${format(item.date, 'w', { locale: ptBR })}`;
      } else {
        label = format(item.date, 'MMM/yy', { locale: ptBR });
      }
      return { ...item, label };
    });

    return {
      data: formattedData,
      summary: {
        totalEntradas,
        totalSaidas,
        saldoFinal,
      },
    };
  },
};