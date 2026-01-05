import { supabase } from '@/lib/customSupabaseClient';
import { getUserId } from './api';

export const relatorioAgendadoService = {
  getRelatoriosAgendados: async () => {
    const { data, error } = await supabase
      .from('relatorios_agendados')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro ao buscar relatórios agendados:", error);
      throw error;
    }
    return data;
  },

  saveRelatorioAgendado: async (relatorio) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const payload = { ...relatorio, user_id: userId };
    
    if (payload.id) {
      // Update
      const { id, ...updateData } = payload;
      updateData.updated_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('relatorios_agendados')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      // Insert
      delete payload.id;
      const { data, error } = await supabase
        .from('relatorios_agendados')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  deleteRelatorioAgendado: async (id) => {
    const { error } = await supabase
      .from('relatorios_agendados')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};