"use client";

import { useEffect } from "react";
import { mockAllowed } from "@/lib/seat-alerts/mock";

export default function ScheduleLayout({ children }: LayoutProps<"/schedule">) {
  // Development only: remember ?mock=1 for this tab before the builder rewrites the query string.
  useEffect(() => {
    mockAllowed(window.location.search);
  }, []);
  return <>{children}</>;
}
