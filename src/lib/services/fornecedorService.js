import { supabase } from '@/lib/customSupabaseClient';
import { getUserId } from './api';

export const fornecedorService = {
  getFornecedores: async () => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro ao buscar fornecedores:", error);
      throw error;
    }
    return data;
  },

  saveFornecedor: async (fornecedorData) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const payload = {
      ...fornecedorData,
      user_id: userId,
    };

    if (payload.id) {
      const { id, ...updateData } = payload;
      const { data, error } = await supabase
        .from('fornecedores')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      delete payload.id;
      const { data, error } = await supabase
        .from('fornecedores')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  deleteFornecedor: async (id) => {
    const { error } = await supabase
      .from('fornecedores')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao deletar fornecedor:", error);
      throw error;
    }
    return true;
  },
};