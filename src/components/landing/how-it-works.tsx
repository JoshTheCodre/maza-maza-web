import { LockIcon } from "./icons";
import { Reveal } from "./reveal";

const STEPS = ["Offer your price", "Get a yes or a counter", "Pick a driver and go"];

export function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="wrap how-grid">
        <div className="stack">
          <h2>Haggle like always. Just faster.</h2>
          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
        <Reveal className="haggle" label="A bargain between a customer and a driver">
          <p className="bubble b-you">
            Yaba to Lekki? <span className="amt">₦2,500</span>
          </p>
          <p className="bubble b-drv">
            Go-slow dey. <span className="amt">₦3,200</span>
          </p>
          <p className="bubble b-you">
            <span className="amt">₦2,800</span>, last price.
          </p>
          <p className="bubble b-drv">Oya, I dey come!</p>
          <p className="hg-lock">
            <LockIcon size={16} strokeWidth={2.2} />
            Deal at ₦2,800
          </p>
        </Reveal>
      </div>
    </section>
  );
}
