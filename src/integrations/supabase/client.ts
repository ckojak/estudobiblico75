// Este é o código que você deve deixar no arquivo client.ts, sem as marcações de conflito.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types'; 

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// Mantemos a chave PUBLISHABLE_KEY, que é a que funciona com seu .env
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY; 

// Verificação de segurança: interrompe o aplicativo se as chaves estiverem faltando.
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("As variáveis de ambiente SUPABASE_URL ou SUPABASE_PUBLISHABLE_KEY estão faltando. Verifique seu arquivo .env.");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});