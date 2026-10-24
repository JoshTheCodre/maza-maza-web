import { BookingCard } from "./booking-card";

export function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1>
            Name your price.
            <br />
            Move <span className="hl">maza-maza.</span>
          </h1>
          <p className="lede">You offer. Drivers say yes or counter. You choose.</p>
        </div>
        <BookingCard />
      </div>
      <div className="road" aria-hidden="true">
        <svg className="road-car" viewBox="0 0 64 30" width="64" height="30">
          <path d="M4 22v-5c0-2 1.4-3.4 3.4-3.6l9-.9 6-6c.9-.9 2.1-1.4 3.4-1.4h12.6c1.6 0 3 .6 4 1.8l5.6 5.8 7.4 1.1c2.3.4 3.8 2.2 3.8 4.5V22c0 .9-.7 1.6-1.6 1.6H5.6C4.7 23.6 4 22.9 4 22z" fill="#FFC72C" />
          <path d="M22 12.4l4.4-4.6c.6-.6 1.4-1 2.3-1H34v5.6zM36 6.8h4.7c1.1 0 2.2.5 3 1.3l4.3 4.3H36z" fill="#063A28" opacity=".85" />
          <circle cx="16" cy="24" r="4.6" fill="#10201A" />
          <circle cx="16" cy="24" r="1.8" fill="#E4EBE2" />
          <circle cx="50" cy="24" r="4.6" fill="#10201A" />
          <circle cx="50" cy="24" r="1.8" fill="#E4EBE2" />
        </svg>
      </div>
    </section>
  );
}
