"use client";

import { AdminPage, Stat } from "@/components/admin/admin-shell";
import { useNow } from "@/hooks/use-now";
import { VEHICLE_LABEL } from "@/lib/config";
import { clock, dayLabel, daysAgo, lagosDate, naira, plainNumber } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function TicketsAdmin() {
  const s = useStore();
  const now = useNow(30_000);
  const today = lagosDate(now);
  const tickets = [...s.driver.tickets].sort((a, b) => b.boughtAt - a.boughtAt);
  const todays = tickets.filter((t) => t.serviceDate === today);
  const car = todays.filter((t) => t.vehicleType === "car").length;
  const bike = todays.filter((t) => t.vehicleType === "bike").length;
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = lagosDate(daysAgo(i, now));
    return { i, total: tickets.filter((t) => t.serviceDate === date).reduce((sum, t) => sum + t.price, 0) };
  });
  const max = Math.max(...week.map((d) => d.total), 1);
  const topUps = s.driver.wallet.filter((w) => w.kind === "top_up");
  const driverName = s.driver.profile.name;

  return (
    <AdminPage title="Tickets & wallet" sub="Day tickets are the only money Maza-Maza earns. Fares go straight to drivers.">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Car tickets today" value={plainNumber(car)} note={`${naira(s.settings.ticketCar)} each`} />
        <Stat label="Bike tickets today" value={plainNumber(bike)} note={`${naira(s.settings.ticketBike)} each`} />
        <Stat label="Ticket revenue today" value={naira(todays.reduce((sum, t) => sum + t.price, 0))} />
        <Stat label="Commission on fares" value="₦0" note="Always" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="grid content-start gap-2">
          <h2 className="font-bold">Ticket revenue, last 7 days</h2>
          <ul className="grid gap-2 rounded-2xl border-[1.5px] border-line bg-surface p-4">
            {week.map((d) => (
              <li key={d.i} className="grid grid-cols-[76px_minmax(0,1fr)_96px] items-center gap-3 text-[0.84rem]">
                <span className="text-muted">{d.i === 0 ? "Today" : dayLabel(daysAgo(d.i, now))}</span>
                <span className="h-3 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                  <i className="block h-full rounded-full bg-brand" style={{ width: `${(d.total / max) * 100}%` }} />
                </span>
                <span className="tabular text-right font-mono font-semibold">{naira(d.total)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="grid content-start gap-2">
          <h2 className="font-bold">Latest ticket sales</h2>
          <ul className="divide-y divide-line rounded-2xl border-[1.5px] border-line bg-surface">
            {tickets.slice(0, 10).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[0.88rem]">
                <span>
                  <b className="font-semibold">{driverName}</b>
                  <small className="block text-[0.76rem] text-muted">
                    {VEHICLE_LABEL[t.vehicleType]} · {t.number}
                  </small>
                </span>
                <span className="tabular text-right font-mono">
                  {naira(t.price)}
                  <small className="block text-[0.74rem] text-muted">
                    {dayLabel(t.boughtAt)}, {clock(t.boughtAt)}
                  </small>
                </span>
              </li>
            ))}
            {!tickets.length && <li className="px-3.5 py-3 text-[0.88rem] text-muted">No tickets sold yet.</li>}
          </ul>
        </section>
      </div>
      <section className="grid gap-2">
        <h2 className="font-bold">Wallet top-ups</h2>
        <ul className="divide-y divide-line rounded-2xl border-[1.5px] border-line bg-surface">
          {topUps.map((w) => (
            <li key={w.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[0.88rem]">
              <span>
                {driverName} · {w.note}
                <small className="block text-[0.76rem] text-muted">
                  {dayLabel(w.createdAt)}, {clock(w.createdAt)} · via Paystack
                </small>
              </span>
              <span className="tabular font-mono font-semibold text-accept">+{naira(w.amount)}</span>
            </li>
          ))}
          {!topUps.length && <li className="px-3.5 py-3 text-[0.88rem] text-muted">No top-ups yet.</li>}
        </ul>
      </section>
    </AdminPage>
  );
}
