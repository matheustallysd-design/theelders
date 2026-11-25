import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Shield, ShieldOff, Upload, BookOpen, Users, Skull, Globe, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { chapter } from "@/content/story";
import { characters } from "@/content/characters";
import { beasts } from "@/content/bestiary";
import { listUploaded, uploadMedia, builtIn } from "@/components/MediaPicker";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel da obra — THE ELDER" },
      { name: "description", content: "Painel de administração de THE ELDER: capítulos, personagens, bestiário, mundo e mídias." },
      { property: "og:title", content: "Painel da obra — THE ELDER" },
      { property: "og:description", content: "Administração de THE ELDER." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Painel,
});

type Person = { id: string; email: string | null; admin: boolean };

function Painel() {
  const { user, isAdmin, loading, setEditMode } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [uploads, setUploads] = useState<{ name: string; url: string; video: boolean }[]>([]);
  const [edited, setEdited] = useState<Set<string>>(new Set());

  const load = async () => {
    const [{ data: profs }, { data: roles }, { data: blocks }] = await Promise.all([
      supabase.from("profiles").select("id,email").order("created_at"),
      supabase.from("user_roles").select("user_id,role"),
      supabase.from("content_blocks").select("page"),
    ]);
    const admins = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
    setPeople((profs ?? []).map((p) => ({ id: p.id, email: p.email, admin: admins.has(p.id) })));
    setEdited(new Set((blocks ?? []).map((b) => b.page)));
    setUploads(await listUploaded());
  };
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  if (loading) return <main className="content-page"><p className="page-lead">Carregando...</p></main>;
  if (!user || !isAdmin) return (
    <main className="content-page"><div className="section-kicker">ACESSO RESTRITO</div><h1>Somente <em>administradores</em></h1>
      <p className="page-lead">Entre com uma conta de administrador para editar a obra.</p><Link to="/auth" className="primary-btn">ENTRAR</Link></main>
  );

  const toggleAdmin = async (p: Person) => {
    const r = p.admin
      ? await supabase.from("user_roles").delete().eq("user_id", p.id).eq("role", "admin")
      : await supabase.from("user_roles").insert({ user_id: p.id, role: "admin" });
    if (r.error) toast.error(r.error.message); else { toast.success(p.admin ? "Administrador removido" : "Agora é administrador"); load(); }
  };
  const resetPage = async (page: string) => {
    if (!confirm("Voltar esta página ao conteúdo original?")) return;
    const r = await supabase.from("content_blocks").delete().eq("page", page);
    if (r.error) toast.error(r.error.message); else { toast.success("Página restaurada"); load(); }
  };
  const onFile = async (f?: File) => { if (!f) return; try { await uploadMedia(f); toast.success("Mídia enviada"); load(); } catch (e) { toast.error((e as Error).message); } };

  const Row = ({ page, label, link }: { page: string; label: string; link: React.ReactNode }) => (
    <li className="pn-row"><span>{label}</span>{edited.has(page) && <em>editada</em>}<span className="pn-actions">{link}{edited.has(page) && <button onClick={() => resetPage(page)}>Restaurar</button>}</span></li>
  );
  const edit = () => setEditMode(true);

  return (
    <main className="content-page pn">
      <div className="section-kicker">PAINEL DA OBRA</div>
      <h1>Bastidores de <em>THE ELDER</em></h1>
      <p className="page-lead">Abra uma página e ligue o <b>Modo edição</b> (já ligado pelos atalhos abaixo). Clique em qualquer texto ou imagem para ver os atalhos.</p>
      <div className="pn-grid">
        <section className="pn-card"><h2><BookOpen size={18} /> Capítulo 01 — cenas</h2><ul>
          {chapter.sections.map((s, i) => <Row key={i} page={`cap01-s${i}`} label={`${String(i + 1).padStart(2, "0")}. ${s.heading}`} link={<Link to="/capitulos" onClick={() => { localStorage.setItem("the-elder:cap01", JSON.stringify({ section: i })); edit(); }}>Editar</Link>} />)}
        </ul></section>
        <section className="pn-card"><h2><Users size={18} /> Personagens</h2><ul>
          {characters.map((c) => <Row key={c.slug} page={`entry-${c.slug}`} label={c.name} link={<Link to="/personagens/$slug" params={{ slug: c.slug }} onClick={edit}>Editar</Link>} />)}
        </ul><h2><Skull size={18} /> Bestiário</h2><ul>
          {beasts.map((c) => <Row key={c.slug} page={`entry-${c.slug}`} label={c.name} link={<Link to="/bestiario/$slug" params={{ slug: c.slug }} onClick={edit}>Editar</Link>} />)}
        </ul><h2><Globe size={18} /> Arquivo do Mundo</h2><ul>
          <Row page="mundo" label="Arquivo do Mundo" link={<Link to="/mundo" onClick={edit}>Editar</Link>} />
        </ul></section>
        <section className="pn-card"><h2><Shield size={18} /> Contas</h2><ul>
          {people.map((p) => <li key={p.id} className="pn-row"><span>{p.email}</span>{p.admin && <em>admin</em>}
            <span className="pn-actions">{p.id !== user.id && <button onClick={() => toggleAdmin(p)}>{p.admin ? <><ShieldOff size={13} /> Remover admin</> : <><Shield size={13} /> Tornar admin</>}</button>}</span></li>)}
        </ul></section>
        <section className="pn-card pn-wide"><h2><ImageIcon size={18} /> Mídias</h2>
          <label className="ed-upload"><Upload size={16} /> Enviar imagem ou vídeo<input type="file" accept="image/*,video/*" hidden onChange={(e) => onFile(e.target.files?.[0])} /></label>
          <div className="ed-grid">{[...uploads, ...builtIn].map((m) => <a key={m.url} href={m.url} target="_blank" rel="noreferrer" className="ed-thumb">{m.video ? <video src={m.url} muted /> : <img src={m.url} alt={m.name} loading="lazy" />}</a>)}</div>
        </section>
      </div>
    </main>
  );
}
