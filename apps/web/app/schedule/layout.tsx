import { ScheduleNav } from "@/components/ScheduleNav";

export default function ScheduleLayout({ children }: LayoutProps<"/schedule">) {
  return (
    <>
      <ScheduleNav />
      {children}
    </>
  );
}
