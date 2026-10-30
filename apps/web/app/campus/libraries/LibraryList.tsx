"use client";

import { orderLibraries, type LibraryHours } from "@turboterp/campus-data";
import { LibraryIcon } from "@/components/icons";
import { Section, SkeletonCard, Tile, TileGrid } from "@/components/ui";
import { compactLibraryName } from "@/lib/libraries";
import { hoursStatus } from "@/lib/status";
import { useCampusClock } from "@/lib/useCampusClock";

/** Library hours with open/closed worked out by the browser's clock, so the page itself can be cached. */
export function LibraryList({ libraries }: { libraries: LibraryHours[] }) {
  const clock = useCampusClock();
  if (!clock) return <SkeletonCard rows={6} />;
  const { today, tomorrow, minutes } = clock;

  const groups = [
    { title: "Libraries", items: orderLibraries(libraries.filter((l) => l.kind === "library")) },
    { title: "Collections & spaces", items: libraries.filter((l) => l.kind === "department") },
  ];

  return groups.map((g) =>
    g.items.length === 0 ? null : (
      <Section key={g.title} title={g.title}>
        <TileGrid>
          {g.items.map((lib) => {
            const s = hoursStatus(lib.days[today], minutes, lib.days[tomorrow]);
            return (
              <Tile
                key={lib.id}
                href={lib.url}
                external
                icon={<LibraryIcon />}
                area="study"
                title={compactLibraryName(lib.name)}
                sub={s.text}
                status={s.status}
              />
            );
          })}
        </TileGrid>
      </Section>
    ),
  );
}
