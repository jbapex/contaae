import { supabase } from '@/lib/customSupabaseClient';

const IA_HISTORY_KEY = 'iaChatHistory';

export const iaService = {
  checkIaIsConfigured: async () => {
    try {
      // We are now checking for a global key, not a user-specific one.
      // This function can be called by a regular user, so we use the public client
      // and rely on RLS (or a public view/function if needed) if there were restrictions.
      // For a simple key check, a dedicated function might be better, but this works.
      const { data, error } = await supabase
        .from('system_config')
        .select('key')
        .eq('key', 'openai_api_key')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is not an application error
        console.error('Error checking IA configuration:', error);
        return false;
      }
      
      // If data is not null, it means the key 'openai_api_key' exists.
      // We don't check the value here for security.
      return !!data;
    } catch (err) {
      console.error('Error in checkIaIsConfigured:', err);
      return false;
    }
  },

  callOpenAIChat: async (messages) => {
    try {
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: { messages },
      });

      if (error) {
        throw new Error(`Supabase function error: ${error.message}`);
      }
      
      if (data.error) {
        throw new Error(`OpenAI API error: ${data.details || data.error}`);
      }

      return data;
    } catch (error) {
      console.error('Error calling OpenAI chat:', error);
      throw error;
    }
  },

  getIaHistory: () => {
    try {
      const savedHistory = localStorage.getItem(IA_HISTORY_KEY);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error('Error getting IA history from localStorage:', error);
      return [];
    }
  },

  saveIaHistory: (history) => {
    try {
      localStorage.setItem(IA_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving IA history to localStorage:', error);
    }
  },
};