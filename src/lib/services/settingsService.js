import { supabase } from '@/lib/customSupabaseClient';
import { planService } from './planService';
import { getUserId } from './api';
import { availableModules } from '@/lib/utils/modules';

export const settingsService = {
  getSettings: async (userId) => {
    const id = userId || await getUserId();
    if (!id) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', id)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar configurações:', error);
      throw error;
    }
    return data;
  },

  saveSettings: async (settings, userId) => {
    const id = userId || await getUserId();
    if (!id) throw new Error("Usuário não autenticado para salvar configurações.");

    const { data, error } = await supabase
      .from('user_settings')
      .upsert({ ...settings, user_id: id, updated_at: new Date() }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
    }
    return data;
  },

  syncWithPlan: async (userId, planId) => {
    const plan = await planService.getPlanById(planId);
    if (!plan || !plan.modules) {
      throw new Error("Plano não encontrado ou não possui módulos definidos.");
    }
    
    const settingsToUpdate = availableModules.reduce((acc, module) => {
      acc[module.id] = !!plan.modules[module.id];
      return acc;
    }, {});

    return await settingsService.saveSettings(settingsToUpdate, userId);
  },
};