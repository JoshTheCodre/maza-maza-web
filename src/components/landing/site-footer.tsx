import Link from "next/link";
import { LogoMark } from "./icons";

const COLUMNS = [
  {
    title: "Ride",
    links: [
      { href: "/ride/search?mode=ride", label: "Book a ride" },
      { href: "/ride/search?mode=send", label: "Send a package" },
    ],
  },
  {
    title: "Drive",
    links: [
      { href: "/driver/signup", label: "Start driving" },
      { href: "#drive", label: "Day tickets" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/signup", label: "Sign up" },
      { href: "/login", label: "Log in" },
      { href: "/help", label: "Help" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="wrap foot-top">
        <div className="foot-brand">
          <a className="logo" href="#top" aria-label="Maza-Maza home">
            <LogoMark />
            maza-maza
          </a>
          <p>Your price. Their yes.</p>
        </div>
        <nav className="foot-cols" aria-label="Footer">
          {COLUMNS.map((col) => (
            <div key={col.title} className="foot-col">
              <h2>{col.title}</h2>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("#") ? <a href={l.href}>{l.label}</a> : <Link href={l.href}>{l.label}</Link>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="wrap foot-bottom">
        <p>© 2026 Maza-Maza · Made in Lagos</p>
        <p className="foot-legal">
          <Link href="/help">Terms</Link>
          <Link href="/help">Privacy</Link>
        </p>
      </div>
    </footer>
  );
}
