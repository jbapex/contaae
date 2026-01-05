import { supabase } from '@/lib/customSupabaseClient';
import { getUserId } from './api';

export const estoqueService = {
  getProdutos: async () => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro ao buscar produtos:", error);
      throw error;
    }
    return data;
  },

  saveProduto: async (produtoData) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const payload = {
      ...produtoData,
      user_id: userId,
      preco_venda: produtoData.preco_venda || null,
      preco_custo: produtoData.preco_custo || null,
    };

    if (payload.id) {
      const { id, ...updateData } = payload;
      const { data, error } = await supabase
        .from('produtos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      delete payload.id;
      const { data, error } = await supabase
        .from('produtos')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  deleteProduto: async (id) => {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao deletar produto:", error);
      throw error;
    }
    return true;
  },

  getMovimentos: async (produtoId) => {
    const { data, error } = await supabase
      .from('movimentos_estoque')
      .select('*')
      .eq('produto_id', produtoId)
      .order('data_movimento', { ascending: false });

    if (error) {
      console.error("Erro ao buscar movimentos de estoque:", error);
      throw error;
    }
    return data;
  },

  addMovimento: async (movimentoData) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const payload = {
      ...movimentoData,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from('movimentos_estoque')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar movimento de estoque:", error);
      throw error;
    }
    return data;
  },
};