import Link from "next/link";

export function WebAppBand() {
  return (
    <section className="band" id="start">
      <div className="stripes" aria-hidden="true" />
      <div className="wrap band-grid">
        <div className="band-copy">
          <h2>No app to download.</h2>
          <p>Open Maza-Maza in your browser and go.</p>
          <div className="band-ctas">
            <Link className="btn btn-danfo btn-lg" href="/ride">
              Book a ride
            </Link>
            <Link className="btn btn-line btn-lg" href="/driver/signup">
              Start driving
            </Link>
          </div>
        </div>
        <div className="phone" aria-hidden="true">
          <div className="phone-screen">
            <div className="ps-top">
              <b>Offers near you</b>
              <span className="ps-live">
                <i />
                Online
              </span>
            </div>
            <div className="ps-ticket">
              <span className="mono">DAY TICKET · ACTIVE</span>
              <b>Until 23:59 tonight</b>
            </div>
            <div className="ps-offer">
              <b>Rumuokoro → GRA</b>
              <span className="amt">₦1,800</span>
              <span>1.2 km away</span>
            </div>
            <div className="ps-offer">
              <b>Trans-Amadi → Woji</b>
              <span className="amt">₦2,200</span>
              <span>2.4 km away</span>
            </div>
            <div className="ps-acts">
              <span className="a1">Counter</span>
              <span className="a2">Accept</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
