"use client";

import { useEffect } from "react";
import { NotificationsList } from "@/components/app/common";
import { Page, PageHeader } from "@/components/app/layout-parts";
import { useStore } from "@/lib/store";

export default function DriverNotifications() {
  const markRead = useStore((s) => s.markRead);
  useEffect(() => () => markRead("driver"), [markRead]);
  return (
    <Page>
      <PageHeader title="Notifications" back="/driver/account" />
      <NotificationsList audience="driver" />
    </Page>
  );
}
