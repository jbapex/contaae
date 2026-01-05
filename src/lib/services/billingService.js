import { supabase } from '@/lib/customSupabaseClient';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const billingService = {
  getBillingStats: async () => {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('amount, status, created_at, user_id')
      .eq('status', 'paid');
    
    if (error) {
      console.error('Error fetching billing stats:', error);
      throw error;
    }
    
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    
    const currentMonthRevenue = invoices
      .filter(inv => new Date(inv.created_at) >= startOfCurrentMonth)
      .reduce((acc, inv) => acc + inv.amount, 0);

    const totalRevenue = invoices.reduce((acc, inv) => acc + inv.amount, 0);

    const activePayingUsers = new Set(invoices.map(inv => inv.user_id)).size;

    const averageTicket = activePayingUsers > 0 ? totalRevenue / activePayingUsers : 0;

    return {
      currentMonthRevenue,
      totalRevenue,
      activePayingUsers,
      averageTicket,
    };
  },

  getAllInvoices: async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        users (email),
        plans (name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }

    return data;
  },
  
  updateInvoiceStatus: async (invoiceId, status) => {
    const updatePayload = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (status === 'paid') {
      updatePayload.paid_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('invoices')
      .update(updatePayload)
      .eq('id', invoiceId)
      .select();
      
    if (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
    
    return data;
  },

  getMonthlyRevenue: async (months = 6) => {
    const dateRanges = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      dateRanges.push({
        name: format(date, 'MMM/yy', { locale: ptBR }),
        start: format(startOfMonth(date), 'yyyy-MM-dd'),
        end: format(endOfMonth(date), 'yyyy-MM-dd'),
      });
    }

    const promises = dateRanges.map(range => 
      supabase
        .from('invoices')
        .select('amount')
        .eq('status', 'paid')
        .gte('paid_at', range.start)
        .lte('paid_at', range.end)
    );

    const results = await Promise.all(promises);

    const chartData = results.map((result, index) => {
      if (result.error) {
        console.error(`Error fetching revenue for ${dateRanges[index].name}:`, result.error);
        return { name: dateRanges[index].name, Receita: 0 };
      }
      const total = result.data.reduce((acc, inv) => acc + inv.amount, 0);
      return { name: dateRanges[index].name, Receita: total };
    });

    return chartData;
  }
};