import { supabase } from '@/lib/customSupabaseClient';

    export const superAdminService = {
      getAllUsers: async () => {
        const { data, error } = await supabase.functions.invoke('super-admin-users');
        
        if (error) {
          console.error("Erro ao buscar usuários via Edge Function:", error);
          throw new Error("Não foi possível buscar os usuários do sistema.");
        }

        if (!Array.isArray(data)) {
          console.error("Resposta inesperada da Edge Function:", data);
          throw new Error("Formato de resposta inválido do servidor.");
        }
        
        return data;
      },

      updateUserPlan: async (userId, planId) => {
        const { data, error } = await supabase.functions.invoke('update-user-plan', {
          body: { userId, planId },
        });

        if (error) {
          console.error(`Erro ao atualizar plano para o usuário ${userId}:`, error);
          throw new Error("Não foi possível atualizar o plano do usuário.");
        }
        return data;
      },

      getUserMetadata: async (userId) => {
        const { data, error } = await supabase
          .from('user_metadata')
          .select('user_id, plan_id, account_status, is_super_admin, module_source')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error(`Erro ao buscar metadados do usuário ${userId}:`, error);
          throw new Error("Não foi possível buscar os metadados do usuário.");
        }
        return data;
      },

      updateUserMetadata: async (userId, metadata) => {
        const { data, error } = await supabase
          .from('user_metadata')
          .upsert({ user_id: userId, ...metadata }, { onConflict: 'user_id' })
          .select()
          .single();

        if (error) {
          console.error(`Erro ao atualizar metadados do usuário ${userId}:`, error);
          throw new Error("Não foi possível atualizar os metadados do usuário.");
        }
        return data;
      }
    };