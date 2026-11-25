import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Ctx = { user: User | null; isAdmin: boolean; loading: boolean; editMode: boolean; setEditMode: (v: boolean) => void; signOut: () => Promise<void> };
const AuthCtx = createContext<Ctx>({ user: null, isAdmin: false, loading: true, editMode: false, setEditMode: () => {}, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const check = async (u: User | null) => {
      setUser(u);
      if (!u) { setIsAdmin(false); setEditMode(false); setLoading(false); return; }
      const { data } = await supabase.rpc("has_role", { _user_id: u.id, _role: "admin" });
      setIsAdmin(!!data); setLoading(false);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
        setTimeout(() => check(session?.user ?? null), 0);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); };
  return <AuthCtx.Provider value={{ user, isAdmin, loading, editMode: editMode && isAdmin, setEditMode, signOut }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
