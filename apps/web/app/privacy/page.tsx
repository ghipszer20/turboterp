import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";
import { PRIVACY, PRIVACY_VERSION } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return <LegalDoc title="Privacy" version={PRIVACY_VERSION} sections={PRIVACY} />;
}
