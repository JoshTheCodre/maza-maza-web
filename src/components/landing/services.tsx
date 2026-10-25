import Link from "next/link";

export function Services() {
  return (
    <section className="section" id="services">
      <div className="wrap">
        <h2 className="sec-title">Ride or send.</h2>
        <div className="svc-grid">
          <Link className="svc" href="/ride/search?mode=ride">
            <div className="svc-art">
              <svg viewBox="0 0 340 170" aria-hidden="true">
                <ellipse className="i-shadow" cx="172" cy="160" rx="150" ry="6" />
                <path
                  className="i-body"
                  d="M28 134V112c0-10 7-17 17-18l56-6 27-30c5-5 11-8 18-8h68c8 0 15 3 21 9l27 29 40 6c12 2 20 11 20 23v17c0 4-3 7-7 7H35c-4 0-7-3-7-7z"
                />
                <path className="i-glass" d="M112 88l22-24c3-3 7-5 11-5h28v29zM183 59h29c6 0 11 2 15 7l20 22h-64z" />
                <path className="i-trim" d="M178 94v38M60 114h18M268 106h14" />
                <rect className="i-light" x="306" y="104" width="16" height="9" rx="4" />
                <rect className="i-tail" x="28" y="103" width="9" height="10" rx="3" />
                <circle className="i-tyre" cx="92" cy="138" r="22" />
                <circle className="i-hub" cx="92" cy="138" r="9" />
                <circle className="i-tyre" cx="256" cy="138" r="22" />
                <circle className="i-hub" cx="256" cy="138" r="9" />
              </svg>
            </div>
            <h3>Maza Ride</h3>
            <p>A car to anywhere in town.</p>
            <span className="svc-go">Book a ride →</span>
          </Link>
          <Link className="svc" href="/ride/search?mode=send">
            <div className="svc-art">
              <svg viewBox="0 0 340 170" aria-hidden="true">
                <ellipse className="i-shadow" cx="176" cy="160" rx="132" ry="6" />
                <rect className="i-box" x="44" y="30" width="80" height="64" rx="8" />
                <path className="i-box-mark" d="M84 30v64M70 30v12M98 30v12" />
                <path className="i-pipe" d="M112 122h46" />
                <circle className="i-tyre" cx="92" cy="130" r="28" />
                <circle className="i-hub" cx="92" cy="130" r="11" />
                <circle className="i-tyre" cx="262" cy="130" r="28" />
                <circle className="i-hub" cx="262" cy="130" r="11" />
                <path className="i-frame" d="M92 130L132 100H202L242 76M202 100l-14 30h-58" />
                <path className="i-tank" d="M128 104c4-16 14-24 30-24h46c12 0 20 6 22 16l2 8z" />
                <rect className="i-seat" x="108" y="88" width="62" height="12" rx="6" />
                <path className="i-frame" d="M262 130L236 60M236 60l-13-4M236 60h18" />
                <circle className="i-light" cx="249" cy="80" r="7" />
              </svg>
            </div>
            <h3>Maza Send</h3>
            <p>A rider for your package.</p>
            <span className="svc-go">Send something →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
