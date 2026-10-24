"use client";

import { useEffect } from "react";
import { NotificationsList } from "@/components/app/common";
import { Page, PageHeader } from "@/components/app/layout-parts";
import { useStore } from "@/lib/store";

export default function CustomerNotifications() {
  const markRead = useStore((s) => s.markRead);
  // Opening the list counts as reading it; the dots stay until the next visit.
  useEffect(() => () => markRead("customer"), [markRead]);
  return (
    <Page>
      <PageHeader title="Notifications" back="/account" />
      <NotificationsList audience="customer" />
    </Page>
  );
}
