import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecyllyyzeykhdsupoqej.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjeWxseXl6ZXlraGRzdXBvcWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0ODMwNTIsImV4cCI6MjA2OTA1OTA1Mn0.iMMYDIdeh1Ro1MkxoB-yuI2Tl7912c7lr2cdlfNHOkc';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
