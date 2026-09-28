import type { Metadata } from "next";
import { PageView } from "@/components/PageView";
import { REFLEX_CONTENT } from "@/content/reflex";
import {
  DocsIntro,
  DocsQuickStart,
  DocsIntegrationPaths,
  DocsGuidesLifecycle,
  DocsCli,
} from "@/components/reflex/DocsComponents";

export const metadata: Metadata = {
  title: "Docs — Gargi Reflex",
  description: REFLEX_CONTENT.hero.descriptor,
};

export default function ReflexDocsPage() {
  return (
    <>
      <PageView page="reflex-docs" />
      <DocsIntro />
      <DocsQuickStart />
      <DocsIntegrationPaths />
      <DocsGuidesLifecycle />
      <DocsCli />
    </>
  );
}
