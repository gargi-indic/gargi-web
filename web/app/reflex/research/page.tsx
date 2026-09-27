import type { Metadata } from "next";
import { PageView } from "@/components/PageView";
import { ResearchHeader } from "@/components/reflex/research/ResearchHeader";
import { ResearchNav } from "@/components/reflex/research/ResearchNav";
import { SectionQuestion } from "@/components/reflex/research/SectionQuestion";
import { SectionHeadline } from "@/components/reflex/research/SectionHeadline";
import { SectionNoiseCeiling } from "@/components/reflex/research/SectionNoiseCeiling";
import { SectionLearningCurve } from "@/components/reflex/research/SectionLearningCurve";
import { SectionTheDial } from "@/components/reflex/research/SectionTheDial";
import { SectionWhereItFails } from "@/components/reflex/research/SectionWhereItFails";
import { SectionEconomics } from "@/components/reflex/research/SectionEconomics";
import { SectionLimitations } from "@/components/reflex/research/SectionLimitations";

export const metadata: Metadata = {
  title: "Research — Gargi Reflex",
  description: "Phase 0 research on autonomous model caching for LLM calls.",
};

export default function ReflexResearchPage() {
  return (
    <>
      <PageView page="reflex-research" />
      <div className="reflex-container research-layout">
        <ResearchNav />
        <article className="research-article">
          <ResearchHeader />
          <SectionQuestion />
          <SectionHeadline />
          <SectionNoiseCeiling />
          <SectionLearningCurve />
          <SectionTheDial />
          <SectionWhereItFails />
          <SectionEconomics />
          <SectionLimitations />
        </article>
      </div>
    </>
  );
}
