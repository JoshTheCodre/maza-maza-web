"use client";

import { HelpCenter } from "@/components/app/help-center";
import { Page, PageHeader } from "@/components/app/layout-parts";

export default function CustomerHelp() {
  return (
    <Page>
      <PageHeader title="Help" back="/account" />
      <HelpCenter audience="customer" />
    </Page>
  );
}
