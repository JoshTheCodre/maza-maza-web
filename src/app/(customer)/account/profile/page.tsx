"use client";

import { Page, PageHeader } from "@/components/app/layout-parts";
import { ProfileForm } from "@/components/app/profile-form";

export default function CustomerProfilePage() {
  return (
    <Page>
      <PageHeader title="Profile" back="/account" />
      <ProfileForm audience="customer" />
    </Page>
  );
}
