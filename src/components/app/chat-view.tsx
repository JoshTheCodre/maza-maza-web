"use client";

import { ChevronLeft, SendHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/display";
import { clock, firstName } from "@/lib/format";
import { tripMessages, useStore } from "@/lib/store";
import type { Side, Trip } from "@/lib/types";

const QUICK: Record<Side, string[]> = {
  customer: ["I'm coming out now", "Where are you?", "I'm by the gate", "Please wait 2 minutes"],
  driver: ["I'm on my way", "I've arrived", "I'm by the gate", "Traffic is heavy, 5 more minutes"],
};

export function ChatView({ trip, me, back }: { trip: Trip; me: Side; back: string }) {
  const s = useStore();
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const messages = tripMessages(s, trip.id);
  const other = me === "customer" ? trip.driver : trip.customer;
  const closed = trip.stage === "completed" || trip.stage === "cancelled";

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const send = (body: string) => {
    s.sendMessage(trip.id, me, body);
    setText("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-none items-center gap-3 border-b border-line bg-surface px-4 py-3">
        <Link href={back} aria-label="Back to trip" className="grid size-10 place-items-center rounded-full border-[1.5px] border-line">
          <ChevronLeft size={20} />
        </Link>
        <Avatar name={other.name} />
        <div className="min-w-0">
          <h1 className="font-bold">{other.short}</h1>
          <p className="text-[0.76rem] text-muted">{me === "customer" ? `${trip.driver.vehicle.plate} · numbers stay private` : "Numbers stay private"}</p>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto bg-bg px-4 py-4">
        <div className="mx-auto grid max-w-xl gap-2">
          {!messages.length && <p className="py-8 text-center text-[0.88rem] text-muted">Send {firstName(other.name)} a message. Keep it about the trip.</p>}
          {messages.map((m) => (
            <div key={m.id} className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${m.from === me ? "justify-self-end rounded-br-md bg-brand text-on-brand" : "justify-self-start rounded-bl-md bg-surface"}`}>
              <p className="text-[0.94rem]">{m.body}</p>
              <p className={`text-right text-[0.66rem] ${m.from === me ? "text-on-brand/75" : "text-muted"}`}>{clock(m.createdAt)}</p>
            </div>
          ))}
          <div ref={end} />
        </div>
      </div>
      {closed ? (
        <p className="flex-none border-t border-line bg-surface px-4 py-3 text-center text-[0.86rem] text-muted">This trip has ended, so the chat is closed.</p>
      ) : (
        <div className="flex-none border-t border-line bg-surface px-4 pt-2 pb-[calc(12px+env(safe-area-inset-bottom))]">
          <div className="no-scrollbar mx-auto flex max-w-xl gap-2 overflow-x-auto pb-2">
            {QUICK[me].map((q) => (
              <button key={q} type="button" onClick={() => send(q)} className="flex-none rounded-full border-[1.5px] border-line px-3 py-1.5 text-[0.82rem] font-semibold hover:border-ink">
                {q}
              </button>
            ))}
          </div>
          <form
            className="mx-auto flex max-w-xl items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
          >
            <label htmlFor="chat-text" className="sr-only">
              Message
            </label>
            <input
              id="chat-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Message ${firstName(other.name)}`}
              autoComplete="off"
              className="min-h-12 min-w-0 flex-1 rounded-full bg-surface-2 px-4 outline-none focus:ring-2 focus:ring-brand"
            />
            <button type="submit" aria-label="Send" disabled={!text.trim()} className="grid size-12 flex-none place-items-center rounded-full bg-brand text-on-brand disabled:opacity-40">
              <SendHorizontal size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/** Chat button for trip screens, with a dot when the other person wrote last. */
export function ChatButton({ trip, me, href }: { trip: Trip; me: Side; href: string }) {
  const last = useStore((s) => {
    const m = tripMessages(s, trip.id);
    return m[m.length - 1]?.from;
  });
  return (
    <Link href={href} className="relative grid justify-items-center gap-1 rounded-2xl border-[1.5px] border-line bg-surface px-1 py-2.5 text-[0.72rem] font-bold hover:border-ink">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 5h16v11H9l-5 4z" />
      </svg>
      Chat
      {last && last !== me && <span className="absolute top-2 right-[30%] size-2.5 rounded-full bg-danfo" aria-label="New message" />}
    </Link>
  );
}
