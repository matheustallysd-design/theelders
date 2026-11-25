import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { media } from "@/content/media";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — THE ELDER" },
      { name: "description", content: "Acesse sua conta de THE ELDER. Administradores podem editar a obra." },
      { property: "og:title", content: "Entrar — THE ELDER" },
      { property: "og:description", content: "Acesse sua conta de THE ELDER." },
    ],
  }),
  component: AuthPage,
});

const G = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
);

function AuthPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (user) nav({ to: "/" }); }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const r = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (r.error) { toast.error(r.error.message); return; }
    if (mode === "up" && !r.data.session) toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail.");
  };
  const oauth = async (p: "google" | "lovable") => {
    const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin });
    if (r.error) toast.error("Não foi possível entrar");
  };

  return (
    <main className="auth-page" style={{ ["--page-art" as string]: `url(${media.elderPreso})` }}>
      <form className="auth-box mg-panel" onSubmit={submit}>
        <span className="mg-tag">{mode === "in" ? "ENTRAR" : "CRIAR CONTA"}</span>
        <h1>THE <b>ELDER</b></h1>
        <button type="button" className="auth-google" onClick={() => oauth("google")}><G /> Continuar com Google</button>
        <button type="button" className="auth-alt" onClick={() => oauth("lovable")}><LovableMark /> Continuar com Lovable</button>
        <div className="auth-or">ou</div>
        <input type="email" required placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required minLength={6} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="primary-btn" disabled={busy}>{busy ? "Aguarde..." : mode === "in" ? "ENTRAR" : "CRIAR CONTA"}</button>
        <button type="button" className="auth-switch" onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}</button>
      </form>
    </main>
  );
}
