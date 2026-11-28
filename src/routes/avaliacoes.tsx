import { EText } from "@/components/Editable";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star, EyeOff, Eye, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Pager } from "@/components/Pager";
import { pageCount, pageSlice } from "@/lib/pagination";
import { average, validateReview, MAX_COMMENT } from "@/lib/reviews";

export const Route = createFileRoute("/avaliacoes")({
  head: () => ({
    meta: [
      { title: "Avaliações dos leitores — THE ELDER" },
      { name: "description", content: "Opiniões e notas dos leitores de THE ELDER. Deixe a sua avaliação da obra." },
      { property: "og:title", content: "Avaliações dos leitores — THE ELDER" },
      { property: "og:description", content: "O que os leitores acharam de THE ELDER." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reviews,
});

const PER = 6;
type Review = { id: string; user_id: string; author: string; rating: number; comment: string; hidden: boolean; created_at: string };

function Stars({ value, onPick }: { value: number; onPick?: (n: number) => void }) {
  return <span className="stars">{[1, 2, 3, 4, 5].map((n) => onPick
    ? <button key={n} type="button" aria-label={`${n} estrela${n > 1 ? "s" : ""}`} onClick={() => onPick(n)}><Star size={26} fill={n <= value ? "currentColor" : "none"} /></button>
    : <Star key={n} size={16} fill={n <= value ? "currentColor" : "none"} />)}</span>;
}

function Reviews() {
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const { data = [] } = useQuery({ queryKey: ["reviews", user?.id ?? null], queryFn: async () => ((await supabase.from("reviews").select("*").order("created_at", { ascending: false })).data ?? []) as Review[] });
  const mine = data.find((r) => r.user_id === user?.id);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const visible = data.filter((r) => !r.hidden);
  const avg = average(visible.map((r) => r.rating));
  const total = pageCount(data.length, PER);
  const refresh = () => qc.invalidateQueries({ queryKey: ["reviews"] });

  const startEdit = () => { if (mine) { setRating(mine.rating); setComment(mine.comment); setName(mine.author); } setEditing(true); };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!user) return;
    const err = validateReview(rating, comment); if (err) { toast.error(err); return; }
    const row = { user_id: user.id, rating, comment: comment.trim(), author: name.trim().slice(0, 40) || (user.email?.split("@")[0] ?? "Leitor") };
    const r = mine ? await supabase.from("reviews").update({ ...row, updated_at: new Date().toISOString() }).eq("id", mine.id) : await supabase.from("reviews").insert(row);
    if (r.error) toast.error(r.error.message); else { toast.success("Avaliação enviada. Obrigado!"); setEditing(false); refresh(); }
  };
  const mod = async (r: Review, action: "hide" | "del") => {
    if (action === "del" && !confirm("Apagar esta avaliação?")) return;
    const res = action === "del" ? await supabase.from("reviews").delete().eq("id", r.id) : await supabase.from("reviews").update({ hidden: !r.hidden }).eq("id", r.id);
    if (res.error) toast.error(res.error.message); else refresh();
  };

  return (
    <main className="content-page rv">
      <div className="section-kicker"><EText id="rv-kicker" text="VOZ DOS LEITORES" /></div>
      <h1><EText id="rv-t1" text="Avaliações de" /> <em><EText id="rv-t2" text="THE ELDER" /></em></h1>
      <div className="rv-summary"><b>{avg ? avg.toFixed(1) : "—"}</b><Stars value={Math.round(avg)} /><span>{visible.length} avaliação{visible.length === 1 ? "" : "ões"}</span></div>

      {!user ? <p className="page-lead"><Link to="/auth" className="primary-btn">ENTRAR PARA AVALIAR</Link></p>
        : (!mine || editing) ? (
          <form className="rv-form mg-panel" onSubmit={submit}>
            <label>Sua nota</label><Stars value={rating} onPick={setRating} />
            <label htmlFor="rv-name">Seu nome (opcional)</label><input id="rv-name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="Como quer aparecer" />
            <label htmlFor="rv-c">Sua opinião</label><textarea id="rv-c" rows={4} maxLength={MAX_COMMENT} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="O que achou da história, das artes, dos personagens..." />
            <button className="primary-btn" type="submit">{mine ? "ATUALIZAR" : "ENVIAR AVALIAÇÃO"}</button>
          </form>
        ) : <p className="page-lead">Você já avaliou a obra. <button className="secondary-btn" onClick={startEdit}>EDITAR MINHA AVALIAÇÃO</button></p>}

      <ul className="rv-list">
        {pageSlice(data, page, PER).map((r) => (
          <li key={r.id} className={`rv-item ${r.hidden ? "hidden-rv" : ""}`}>
            <div className="rv-head"><b>{r.author}</b><Stars value={r.rating} /><small>{new Date(r.created_at).toLocaleDateString("pt-BR")}</small>{r.hidden && <em>oculta</em>}</div>
            {r.comment && <p>{r.comment}</p>}
            {isAdmin && <div className="rv-mod"><button onClick={() => mod(r, "hide")}>{r.hidden ? <><Eye size={13} /> Mostrar</> : <><EyeOff size={13} /> Ocultar</>}</button><button onClick={() => mod(r, "del")}><Trash2 size={13} /> Apagar</button></div>}
          </li>
        ))}
        {!data.length && <li className="rv-item"><p>Ainda não há avaliações. Seja o primeiro!</p></li>}
      </ul>
      <Pager current={Math.min(page, total - 1)} total={total} onGo={(n) => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
    </main>
  );
}
