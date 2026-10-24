import type { ReactNode } from "react";

function SafeIcon({ children }: { children: ReactNode }) {
  return (
    <span className="safe-ico">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </span>
  );
}

export function Safety() {
  return (
    <section className="section safety" id="safety">
      <div className="wrap">
        <h2 className="sec-title">Safe on every trip.</h2>
        <ul className="safe-grid">
          <li className="safe">
            <SafeIcon>
              <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
              <path d="M9 12l2 2 4-4" />
            </SafeIcon>
            <h3>Checked drivers</h3>
            <p>ID, licence and a guarantor.</p>
          </li>
          <li className="safe">
            <SafeIcon>
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </SafeIcon>
            <h3>Locked fares</h3>
            <p>The price can&apos;t change on the road.</p>
          </li>
          <li className="safe">
            <SafeIcon>
              <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </SafeIcon>
            <h3>Share your trip</h3>
            <p>Family can follow you live.</p>
          </li>
        </ul>
      </div>
    </section>
  );
}
