"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoMark } from "./icons";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="wrap">
        <nav className="nav" aria-label="Main">
          <a className="logo" href="#top" aria-label="Maza-Maza home">
            <LogoMark />
            maza-maza
          </a>
          <div className="nav-links">
            <Link href="/ride">Ride</Link>
            <a href="#drive">Drive</a>
            <Link href="/login">Log in</Link>
          </div>
          <div className="nav-cta">
            <Link className="btn btn-danfo btn-sm" href="/signup">
              Sign up
            </Link>
            <button
              className="menu-btn"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </nav>
        <div className="mobile-menu" id="mobile-menu" hidden={!menuOpen}>
          <Link href="/ride" onClick={closeMenu}>
            Ride
          </Link>
          <a href="#drive" onClick={closeMenu}>
            Drive
          </a>
          <Link href="/login" onClick={closeMenu}>
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}
