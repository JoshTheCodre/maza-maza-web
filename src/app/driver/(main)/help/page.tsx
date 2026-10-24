"use client";

import { HelpCenter } from "@/components/app/help-center";
import { Page, PageHeader } from "@/components/app/layout-parts";

export default function DriverHelp() {
  return (
    <Page>
      <PageHeader title="Help" back="/driver/account" />
      <HelpCenter audience="driver" />
    </Page>
  );
}
