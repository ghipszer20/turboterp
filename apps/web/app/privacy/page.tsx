import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";
import { PRIVACY, PRIVACY_VERSION } from "@turboterp/app-core/legal";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return <LegalDoc title="Privacy Policy" version={PRIVACY_VERSION} sections={PRIVACY} />;
}
