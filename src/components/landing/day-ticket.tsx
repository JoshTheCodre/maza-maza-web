"use client";

import { useSyncExternalStore } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Today's date only exists in the browser. The server renders the placeholder,
// and React swaps in the viewer's local date straight after hydrating.
const subscribe = () => () => {};
const getToday = () => {
  const d = new Date();
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
const getServerToday = () => "Today";

export function DayTicket() {
  const today = useSyncExternalStore(subscribe, getToday, getServerToday);
  return (
    <div className="ticket" role="img" aria-label="A day ticket for a car driver: valid until 23:59 today, 3,000 naira, 0% commission">
      <div className="t-main">
        <div className="t-top">
          <span className="t-brand">maza-maza</span>
          <span>Day ticket</span>
        </div>
        <p className="t-big">You&apos;re on the road today</p>
        <dl className="t-grid">
          <div>
            <dt>Date</dt>
            <dd>{today}</dd>
          </div>
          <div>
            <dt>Valid</dt>
            <dd>Until 23:59</dd>
          </div>
          <div>
            <dt>Commission</dt>
            <dd>0%</dd>
          </div>
        </dl>
      </div>
      <div className="t-stub">
        <span className="t-paid">PAID</span>
        <span className="t-price">
          <strong>₦3,000</strong>
          <span>for today</span>
        </span>
        <span className="barcode" />
      </div>
    </div>
  );
}
