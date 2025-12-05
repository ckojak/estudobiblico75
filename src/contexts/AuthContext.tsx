import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Defina os tipos de função (role) que você usará
type UserRole = 'usuario_normal' | 'colaborador' | 'admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | null; // NOVO: Campo para armazenar a função do usuário
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithFacebook: () => Promise<{ error: Error | null }>;
  signInWithApple: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null); // NOVO: Estado para a função

  // FUNÇÃO NOVA: Busca o perfil do usuário na tabela 'profiles'
  const getUserProfile = async (id: string) => {
    const { data, error } = await supabase
      .from('profiles') // Altere 'profiles' se o nome da sua tabela for diferente
      .select('role')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Erro ao buscar perfil:", error);
      // Retorna o padrão ou null se não for encontrado
      return null; 
    }
    // Retorna a função ou o padrão 'usuario_normal' se o campo estiver vazio
    return (data?.role as UserRole) || 'usuario_normal';
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => { // MUDANÇA: Tornar assíncrono para buscar o perfil
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Se o usuário logou, busca a função dele
          const role = await getUserProfile(session.user.id);
          setUserRole(role);
        } else {
          setUserRole(null); // Limpa a função ao deslogar
        }
        setLoading(false);
      }
    );

    // Tentativa inicial de pegar a sessão
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const role = await getUserProfile(session.user.id);
        setUserRole(role);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({ // MUDANÇA: Pega 'data' para garantir o ID
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });
    
    // NOVO: Cria o perfil na tabela 'profiles' após o cadastro
    if (!error && data.user) { 
      await supabase
        .from('profiles') // Sua tabela de perfis
        .insert({ 
          id: data.user.id, 
          full_name: fullName, 
          role: 'usuario_normal' // Define a função padrão
        });
    }

    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    return { error: error as Error | null };
  };

  const signInWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    return { error: error as Error | null };
  };

  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, signIn, signUp, signInWithGoogle, signInWithFacebook, signInWithApple, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}