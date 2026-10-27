"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChatView } from "@/components/app/chat-view";
import { AppProvider } from "@/components/app/providers";
import { useStore } from "@/lib/store";

/** The receiver's side of a delivery's group chat, opened from the tracking link. */
export default function ReceiverChatPage() {
  return (
    <AppProvider>
      <ReceiverChat />
    </AppProvider>
  );
}

function ReceiverChat() {
  const { id } = useParams<{ id: string }>();
  const trip = useStore((s) => s.trips.find((t) => t.id === id && t.mode === "send"));
  if (!trip) {
    return (
      <div className="grid min-h-dvh place-items-center px-6 text-center">
        <div className="grid gap-3">
          <h1 className="font-display text-xl font-bold">This chat has closed</h1>
          <Link href="/" className="font-bold text-brand">
            Go to Maza-Maza
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-dvh flex-col pt-[env(safe-area-inset-top)]">
      <ChatView trip={trip} me="recipient" back={`/share/${trip.id}`} />
    </div>
  );
}
