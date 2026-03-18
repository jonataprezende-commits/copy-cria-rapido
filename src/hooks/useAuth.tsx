import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  name: string | null;
  plan: string;
  generations_used: number;
  generations_limit: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  preferred_template?: string;
  xp?: number;
  xp_level?: string;
  analyses_used?: number;
  analyses_limit?: number;
  rewrites_used?: number;
  rewrites_limit?: number;
  coach_sessions_used?: number;
  coach_sessions_limit?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  isSubscribed: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (!error && data) {
        setProfile(data as any);
        setIsSubscribed(data.plan === "pro");
      } else if (error && error.code !== 'PGRST116') {
        console.error("Error fetching profile:", error);
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    }
  };

  const refreshProfile = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user) {
      await fetchProfile(currentSession.user.id);
    }
  };

  const checkSubscription = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (!error && data?.subscribed) {
        setIsSubscribed(true);
        await refreshProfile();
      }
    } catch (e) {
      console.error("Error checking subscription:", e);
    }
  };

  useEffect(() => {
    // Initial session check
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
          setIsSubscribed(false);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    checkSubscription();
    const interval = setInterval(checkSubscription, 300000); // Check every 5 minutes instead of 1
    return () => clearInterval(interval);
  }, [user]);

  const signUp = async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || "" },
        emailRedirectTo: window.location.origin + '/auth/callback',
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error during sign out:", err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsSubscribed(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, signUp, signIn, signOut, refreshProfile, checkSubscription, isSubscribed }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
