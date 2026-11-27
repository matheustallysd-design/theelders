import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, BookOpen, Users, Compass, Shield, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { EText } from "@/components/Editable";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, editMode, setEditMode, signOut } = useAuth();

  return (
    <header className="site-header">
      <Link to="/" className="site-logo" onClick={() => setOpen(false)}>THE <b>ELDER</b></Link>
      <nav className={`site-nav ${open ? "open" : ""}`}>
        <Link to="/capitulos" onClick={() => setOpen(false)}><BookOpen size={16} /> Ler</Link>
        <Link to="/mundo" onClick={() => setOpen(false)}><Compass size={16} /> Mundo</Link>
        <Link to="/personagens" onClick={() => setOpen(false)}><Users size={16} /> Personagens</Link>
        <Link to="/bestiario" onClick={() => setOpen(false)}><Shield size={16} /> Bestiário</Link>
        <Link to="/avaliacoes" onClick={() => setOpen(false)}><Star size={16} /> Avaliações</Link>
        {isAdmin && <Link to="/painel" onClick={() => setOpen(false)}>Painel</Link>}
        {isAdmin && (
          <button
            type="button"
            className={editMode ? "edit-toggle-btn active" : "edit-toggle-btn"}
            onClick={() => setEditMode(!editMode)}
            title="Ligar/desligar modo de edição"
          >
            {editMode ? "● Modo edição: ON" : "○ Modo edição"}
          </button>
        )}
        {user ? (
          <button type="button" className="auth-nav-btn" onClick={() => signOut()}>Sair</button>
        ) : (
          <Link to="/auth" className="auth-nav-btn" onClick={() => setOpen(false)}>Entrar</Link>
        )}
      </nav>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Abrir menu">{open ? <X /> : <Menu />}</button>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-brand">
        <EText id="footer-brand-the" text="THE" /> <b><EText id="footer-brand-elder" text="ELDER" /></b>
      </div>
      <p>
        <EText id="footer-slogan" text="Uma história sobre aquilo que o mundo escolheu esquecer." />
      </p>
      <span>
        <EText id="footer-tagline" text="PROJETO INDEPENDENTE · 2026" />
      </span>
    </footer>
  );
}
