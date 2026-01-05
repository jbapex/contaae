import { supabase } from '@/lib/customSupabaseClient';

    export const globalSettingsService = {
      getGlobalSettings: async (key) => {
        const { data, error } = await supabase
          .from('system_config')
          .select('value')
          .eq('key', key)
          .maybeSingle();

        if (error) {
          console.error(`Erro ao buscar configuração global (${key}):`, error);
          throw error;
        }

        return data ? data.value : null;
      },

      saveGlobalSettings: async (key, value) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            throw new Error("Sessão não encontrada. Faça login novamente.");
        }

        const { data, error } = await supabase.functions.invoke('super-admin-settings', {
          body: { key, value },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          }
        });

        if (error) {
          console.error(`Erro ao salvar configuração global (${key}) via Edge Function:`, error);
          throw new Error(error.message || "Não foi possível salvar a configuração.");
        }
        
        // As edge functions do Supabase podem retornar um objeto de erro dentro de uma resposta 200 OK.
        // É importante verificar isso.
        if (data && data.error) {
          console.error(`Erro retornado pela Edge Function:`, data.error);
          throw new Error(data.error);
        }

        return data;
      },
    };