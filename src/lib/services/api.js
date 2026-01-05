import { supabase } from '@/lib/customSupabaseClient';

export const getUserId = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
};