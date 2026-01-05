import { supabase } from '@/lib/customSupabaseClient';
import { getUserId } from './api';

export const etapaService = {
  getEtapas: async () => {
    const { data, error } = await supabase.from('etapas').select('*').order('ordem');
    if (error) {
        console.error('Erro ao buscar etapas:', error);
        return [];
    }
    return data;
  },
  
  saveEtapa: async (etapaData) => {
    const userId = await getUserId();
    if(!userId) throw new Error("Usuário não autenticado");

    const payload = { ...etapaData, user_id: userId };

    if(etapaData.id) {
        const { data, error } = await supabase.from('etapas').update(payload).eq('id', etapaData.id).select().single();
        if(error) throw error;
        return data;
    } else {
        const { data, error } = await supabase.from('etapas').insert(payload).select().single();
        if (error) throw error;
        return data;
    }
  },

  updateEtapasOrder: async (etapas) => {
    const updates = etapas.map(etapa => ({ id: etapa.id, ordem: etapa.ordem }));
    const { error } = await supabase.from('etapas').upsert(updates);
    if (error) throw error;
  },
  
  deleteEtapa: async (etapaId) => {
    const { error } = await supabase.from('etapas').delete().eq('id', etapaId);
    if (error) throw error;
  },
};