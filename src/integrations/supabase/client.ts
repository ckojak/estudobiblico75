// Este arquivo configura a conexão do projeto com o Supabase.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types'; // Assumindo que você tem o arquivo de tipos gerado

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// CORREÇÃO: Usamos PUBLISHABLE_KEY, que é o nome que você tem no seu .env.
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY; 

// Verificação de segurança: interrompe o aplicativo se as chaves estiverem faltando.
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // MUDANÇA: Alerta o usuário para verificar o nome correto no .env
  throw new Error("As variáveis de ambiente SUPABASE_URL ou SUPABASE_PUBLISHABLE_KEY estão faltando. Verifique seu arquivo .env.");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});