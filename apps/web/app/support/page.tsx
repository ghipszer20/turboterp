import { permanentRedirect } from "next/navigation";

// The page was renamed to Donate (owner, 2026-10-04); old links keep working.
export default function SupportPage() {
  permanentRedirect("/donate");
}
