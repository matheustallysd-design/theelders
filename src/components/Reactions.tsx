import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const kinds = [["arrepiante", "😱", "Arrepiante"], ["epico", "⚔️", "Épico"], ["misterioso", "🌀", "Misterioso"]] as const;

export function Reactions({ chapter }: { chapter: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["reactions", chapter, user?.id], queryFn: async () => {
    const counts = (await supabase.rpc("reaction_counts", { _chapter: chapter })).data ?? [];
    const own = user ? (await supabase.from("reactions").select("kind").eq("chapter", chapter).eq("user_id", user.id).maybeSingle()).data?.kind : undefined;
    return { counts: Object.fromEntries(counts.map((c) => [c.kind, Number(c.total)])) as Record<string, number>, own };
  } });
  const mine = data?.own;
  const react = async (kind: string) => {
    if (!user) return;
    const r = mine === kind ? await supabase.from("reactions").delete().eq("user_id", user.id).eq("chapter", chapter)
      : await supabase.from("reactions").upsert({ user_id: user.id, chapter, kind }, { onConflict: "user_id,chapter" });
    if (r.error) toast.error(r.error.message); else qc.invalidateQueries({ queryKey: ["reactions", chapter] });
  };
  return (
    <div className="reactions">
      <span>O QUE ACHOU DESTE CAPÍTULO?</span>
      <div>{kinds.map(([k, ico, l]) => <button key={k} className={mine === k ? "on" : ""} disabled={!user} onClick={() => react(k)}>{ico} {l} <b>{data?.counts[k] ?? 0}</b></button>)}</div>
      {!user && <Link to="/auth">Entre para reagir</Link>}
      <Link to="/avaliacoes" className="reactions-rev">Deixe sua avaliação →</Link>
    </div>
  );
}
