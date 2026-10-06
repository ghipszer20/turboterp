// Line icons in the spirit of SF Symbols (24px grid, 1.75 stroke).
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 24, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const TodayIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
  </Icon>
);

export const CampusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 10.5 12 5l9 5.5" />
    <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" />
    <path d="M3 20.5h18" />
  </Icon>
);

export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" strokeWidth={2.4} />
  </Icon>
);

export const ScheduleIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
    <path d="M8 14h3M8 17h6" />
  </Icon>
);


export const DiningIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10" />
    <path d="M17 21V3c-2.2 1.2-3.5 3.6-3.5 7v3H17" />
  </Icon>
);

export const LibraryIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H9v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
    <path d="M9 4h4v16H9z" />
    <path d="m15 5.2 3.2-.8 2.3 15-3.2.8z" />
  </Icon>
);

export const GymIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6.5 8v8M17.5 8v8M3.5 10v4M20.5 10v4M6.5 12h11" />
  </Icon>
);

export const BusIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4.5" y="3.5" width="15" height="14" rx="3" />
    <path d="M4.5 11h15M8 17.5v2.5M16 17.5v2.5" />
    <circle cx="8.5" cy="14.3" r=".6" fill="currentColor" />
    <circle cx="15.5" cy="14.3" r=".6" fill="currentColor" />
  </Icon>
);

export const RoomIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 20.5V5a1.5 1.5 0 0 1 1.5-1.5h11A1.5 1.5 0 0 1 19 5v15.5" />
    <path d="M3 20.5h18" />
    <circle cx="15" cy="12.5" r=".7" fill="currentColor" />
  </Icon>
);

export const ChevronIcon = (p: IconProps) => (
  <Icon size={16} {...p}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
);

export const ExternalIcon = (p: IconProps) => (
  <Icon size={16} {...p}>
    <path d="M14 4h6v6M20 4l-8.5 8.5" />
    <path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
  </Icon>
);

export const LocationIcon = (p: IconProps) => (
  <Icon size={18} {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </Icon>
);

export const InfoIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5" />
    <circle cx="12" cy="7.8" r=".9" fill="currentColor" stroke="none" />
  </Icon>
);

export const AdvisorIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 9.5 12 5l9 4.5-9 4.5z" />
    <path d="M7 11.6V16c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4.4" />
    <path d="M21 9.5V15" />
  </Icon>
);

/** Swaps the "From" and "To" fields in the trip planner. */
export const SwapIcon = (p: IconProps) => (
  <Icon size={18} {...p}>
    <path d="M7 4v13M7 17l-3.5-3.5M7 17l3.5-3.5" />
    <path d="M17 20V7M17 7l3.5 3.5M17 7l-3.5 3.5" />
  </Icon>
);

/** A stop tapped onto the map instead of picked from search. */
export const MapPinIcon = (p: IconProps) => (
  <Icon size={16} {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </Icon>
);

export const FlagIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 21V4" />
    <path d="M5 4.5h12l-2.5 4 2.5 4H5" />
  </Icon>
);

export const HeartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />
  </Icon>
);

export const SearchIcon = (p: IconProps) => (
  <Icon size={20} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Icon>
);
