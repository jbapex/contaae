import { supabase } from '@/lib/customSupabaseClient';
import { getUserId } from './api';

export const userService = {
  getProfile: async () => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const { data, error } = await supabase
      .from('user_profiles')
      .select('nome, whatsapp_number')
      .eq('user_id', userId)
      .maybeSingle(); 

    if (error) {
      console.error("Erro ao buscar perfil:", error);
      throw error;
    }
    
    return data;
  },

  updateProfile: async ({ nome, whatsapp_number }) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const payload = { 
      user_id: userId,
      nome: nome,
      whatsapp_number: whatsapp_number,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error;
    }

    return data;
  },

  updateUserEmail: async (newEmail) => {
    const { data, error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      console.error("Erro ao atualizar e-mail:", error);
      throw error;
    }
    return data;
  },

  updateUserPassword: async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      console.error("Erro ao atualizar senha:", error);
      throw error;
    }
    return data;
  },
};