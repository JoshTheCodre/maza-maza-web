"use client";

import { useParams } from "next/navigation";
import { ChatView } from "@/components/app/chat-view";
import { Page } from "@/components/app/layout-parts";
import { ButtonLink } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export default function CustomerChat() {
  const { id } = useParams<{ id: string }>();
  const trip = useStore((s) => s.trips.find((t) => t.id === id && t.customerSource === "me"));
  if (!trip) {
    return (
      <Page>
        <h1 className="font-display text-xl font-bold">Chat not found</h1>
        <ButtonLink href="/ride">Back home</ButtonLink>
      </Page>
    );
  }
  return <ChatView trip={trip} me="customer" back={`/ride/trip/${trip.id}`} />;
}
