import type { Metadata } from "next";
import { PageView } from "@/components/PageView";
import { REFLEX_CONTENT } from "@/content/reflex";
import { Hero } from "@/components/reflex/Hero";
import { Problem } from "@/components/reflex/Problem";
import { Loop } from "@/components/reflex/Loop";
import { Gates } from "@/components/reflex/Gates";
import { Contract } from "@/components/reflex/Contract";
import { Evidence } from "@/components/reflex/Evidence";
import { SixWaysIn } from "@/components/reflex/SixWaysIn";
import { ColdStartAndHumans } from "@/components/reflex/ColdStartAndHumans";
import { Vision } from "@/components/reflex/Vision";
import { WhenNotToUse } from "@/components/reflex/WhenNotToUse";
import { OpenSourceCta } from "@/components/reflex/OpenSourceCta";

export const metadata: Metadata = {
  title: "Gargi Reflex",
  description: REFLEX_CONTENT.hero.descriptor,
};

export default function ReflexPage() {
  return (
    <>
      <PageView page="reflex" />
      <Hero />
      <Problem />
      <Loop />
      <Gates />
      <Contract />
      <Evidence />
      <SixWaysIn />
      <ColdStartAndHumans />
      <Vision />
      <WhenNotToUse />
      <OpenSourceCta />
    </>
  );
}
