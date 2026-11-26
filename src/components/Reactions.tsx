import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const kinds = [["arrepiante", "😱", "Arrepiante"], ["epico", "⚔️", "Épico"], ["misterioso", "🌀", "Misterioso"]] as const;

export function Reactions({ chapter }: { chapter: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["reactions", chapter], queryFn: async () => (await supabase.from("reactions").select("user_id,kind").eq("chapter", chapter)).data ?? [] });
  const mine = data.find((r) => r.user_id === user?.id)?.kind;
  const react = async (kind: string) => {
    if (!user) return;
    const r = mine === kind ? await supabase.from("reactions").delete().eq("user_id", user.id).eq("chapter", chapter)
      : await supabase.from("reactions").upsert({ user_id: user.id, chapter, kind }, { onConflict: "user_id,chapter" });
    if (r.error) toast.error(r.error.message); else qc.invalidateQueries({ queryKey: ["reactions", chapter] });
  };
  return (
    <div className="reactions">
      <span>O QUE ACHOU DESTE CAPÍTULO?</span>
      <div>{kinds.map(([k, ico, l]) => <button key={k} className={mine === k ? "on" : ""} disabled={!user} onClick={() => react(k)}>{ico} {l} <b>{data.filter((r) => r.kind === k).length}</b></button>)}</div>
      {!user && <Link to="/auth">Entre para reagir</Link>}
      <Link to="/avaliacoes" className="reactions-rev">Deixe sua avaliação →</Link>
    </div>
  );
}
