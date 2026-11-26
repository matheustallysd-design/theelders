import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, PenLine, LogIn, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const active = { className: "active" };
  const { user, isAdmin, editMode, setEditMode, signOut } = useAuth();
  return (
    <header className="topbar">
      <Link to="/" className="brand" aria-label="Ir para o início" onClick={close}>
        <span className="brand-mark">E</span>
        <span>THE <b>ELDER</b><small>CHRONICLES OF THE LOST AGE</small></span>
      </Link>
      <nav className={open ? "nav open" : "nav"}>
        <Link to="/" activeProps={active} activeOptions={{ exact: true }} onClick={close}>Início</Link>
        <Link to="/capitulos" activeProps={active} onClick={close}>Capítulos</Link>
        <Link to="/mundo" activeProps={active} onClick={close}>Arquivo do Mundo</Link>
        <Link to="/personagens" activeProps={active} onClick={close}>Personagens</Link>
        <Link to="/bestiario" activeProps={active} onClick={close}>Bestiário</Link>
        <Link to="/avaliacoes" activeProps={active} onClick={close}>Avaliações</Link>
        {isAdmin && <Link to="/painel" activeProps={active} onClick={close}><LayoutDashboard size={14} /> Painel</Link>}
        {isAdmin && <button className={editMode ? "nav-edit on" : "nav-edit"} onClick={() => setEditMode(!editMode)}><PenLine size={14} /> {editMode ? "Editando" : "Modo edição"}</button>}
        {user ? <button className="nav-auth" onClick={() => { signOut(); close(); }}><LogOut size={14} /> Sair</button>
          : <Link to="/auth" className="nav-auth" onClick={close}><LogIn size={14} /> Entrar</Link>}
      </nav>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Abrir menu">{open ? <X /> : <Menu />}</button>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer><div className="footer-brand">THE <b>ELDER</b></div><p>Uma história sobre aquilo que o mundo escolheu esquecer.</p><span>PROJETO INDEPENDENTE · 2026</span></footer>
  );
}
