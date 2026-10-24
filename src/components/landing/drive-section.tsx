import Link from "next/link";
import { DayTicket } from "./day-ticket";

export function DriveSection() {
  return (
    <section className="section drive" id="drive">
      <div className="wrap drive-grid">
        <div className="drive-copy">
          <p className="kicker">For drivers &amp; riders</p>
          <h2>Pay for the day. Keep every naira.</h2>
          <p>No commission. Only buy a ticket on days you work.</p>
          <div className="prices">
            <span>
              <b>₦3,000</b> a day · car
            </span>
            <span>
              <b>₦1,500</b> a day · bike
            </span>
          </div>
          <Link className="btn btn-primary btn-lg" href="/driver/signup">
            Start driving
          </Link>
        </div>
        <div className="ticket-wrap">
          <DayTicket />
        </div>
      </div>
    </section>
  );
}
