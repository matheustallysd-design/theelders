import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const active = { className: "active" };
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
