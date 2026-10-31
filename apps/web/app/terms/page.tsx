import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";
import { TERMS, TERMS_VERSION } from "@turboterp/app-core/legal";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return <LegalDoc title="Terms of Use" version={TERMS_VERSION} sections={TERMS} />;
}
