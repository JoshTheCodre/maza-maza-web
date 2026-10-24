"use client";

import { Page, PageHeader } from "@/components/app/layout-parts";
import { ProfileForm } from "@/components/app/profile-form";
import { useStore } from "@/lib/store";

export default function DriverProfilePage() {
  const approved = useStore((s) => s.driver.status !== "none");
  return (
    <Page>
      <PageHeader title="Profile" back="/driver/account" />
      <ProfileForm audience={approved ? "driver" : "customer"} />
    </Page>
  );
}
