import { supabase } from '@/lib/customSupabaseClient';

    export const planService = {
      getAllPlans: async () => {
        const { data, error } = await supabase.from('plans').select('*');
        if (error) {
          console.error("Erro ao buscar planos:", error);
          throw error;
        }
        return data;
      },

      getPlanById: async (planId) => {
        const { data, error } = await supabase.from('plans').select('*').eq('id', planId).single();
        if (error) {
          console.error(`Erro ao buscar plano ${planId}:`, error);
          throw error;
        }
        return data;
      },

      createPlan: async (planData) => {
        const { data, error } = await supabase.from('plans').insert(planData).select().single();
        if (error) {
          console.error("Erro ao criar plano:", error);
          throw error;
        }
        return data;
      },

      updatePlan: async (planId, planData) => {
        const { data, error } = await supabase.from('plans').update(planData).eq('id', planId).select().single();
        if (error) {
          console.error("Erro ao atualizar plano:", error);
          throw error;
        }
        return data;
      },

      deletePlan: async (planId) => {
        const { error } = await supabase.from('plans').delete().eq('id', planId);
        if (error) {
          console.error("Erro ao deletar plano:", error);
          throw error;
        }
        return true;
      },
    };