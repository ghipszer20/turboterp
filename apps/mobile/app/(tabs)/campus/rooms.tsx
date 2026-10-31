import { useMemo, useState, type ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Card, EmptyState, ScreenState, Text, radius, spacing, tap, useTheme } from "../../../src/ui";
import { Chip, ChipRow, RefreshPage } from "../../../src/dining/parts";
import {
  dayChoices,
  daysWithOpenRooms,
  ROOM_SIZES,
  roomCards,
  roomLibraries,
  roomRows,
  roomTypes,
  type RoomCard,
} from "../../../src/campus/model";
import { openLink } from "../../../src/campus/open";
import { useRooms } from "../../../src/campus/useCampusData";
import { useMinuteClock } from "../../../src/today/useToday";
import { dataAge } from "@turboterp/app-core/age";

function Scroller({ children }: { children: ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
      {children}
    </ScrollView>
  );
}

function SlotButton({ label, url, room, current }: { label: string; url: string; room: string; current: boolean }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={() => {
        tap();
        openLink(url);
      }}
      accessibilityRole="link"
      accessibilityLabel={`${room}, free ${label}. Opens LibCal to book.`}
      style={({ pressed }) => ({
        minHeight: 36,
        justifyContent: "center",
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: pressed ? c.surfacePressed : current ? c.openTint : c.accentTint,
      })}
    >
      <Text variant="sub" style={{ color: current ? c.open : c.accent, fontWeight: "600" }}>
        {label}
      </Text>
    </Pressable>
  );
}

function RoomItem({ room }: { room: RoomCard }) {
  return (
    <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
      <View>
        <Text variant="body">{room.title}</Text>
        <Text variant="sub" tone="text2">
          {room.sub}
        </Text>
      </View>
      <ChipRow>
        {room.slots.map((s) => (
          <SlotButton key={s.start} label={s.label} url={s.url} room={room.title} current={s.current} />
        ))}
      </ChipRow>
    </Card>
  );
}

export default function Rooms() {
  const rooms = useRooms();
  const { clock, now } = useMinuteClock();
  const [library, setLibrary] = useState(0);
  const [size, setSize] = useState(1);
  const [type, setType] = useState<string | null>(null);
  const [freeNow, setFreeNow] = useState(false);
  const [pickedDay, setPickedDay] = useState<string | null>(null);

  const rows = useMemo(() => (rooms.data ? roomRows(rooms.data) : []), [rooms.data]);
  const libraries = useMemo(() => (rooms.data ? roomLibraries(rooms.data) : []), [rooms.data]);
  const days = useMemo(() => {
    const open = daysWithOpenRooms(rows);
    return dayChoices(clock.today).filter((d) => d.date === clock.today || open.has(d.date));
  }, [rows, clock.today]);
  const day = pickedDay && days.some((d) => d.date === pickedDay) ? pickedDay : clock.today;
  const types = useMemo(() => roomTypes(rows.map((r) => ({ ...r, library: r.library })), library), [rows, library]);
  const cards = useMemo(() => roomCards(rows, { library, size, type, day, freeNow }, clock), [rows, library, size, type, day, freeNow, clock]);
  const updated = rooms.data?.updatedAt ? ` (${dataAge(rooms.data.updatedAt, now)})` : "";

  return (
    <RefreshPage title="Study Rooms" subtitle="Libraries" refreshing={rooms.refreshing} onRefresh={() => void rooms.refresh()}>
      <ScreenState
        loading={rooms.status === "loading"}
        offline={rooms.status === "offline"}
        error={rooms.status === "error"}
        hasData={!!rooms.data}
        onRetry={() => void rooms.refresh()}
      >
        <Scroller>
          {days.map((d) => (
            <Chip key={d.date} label={d.label} pressed={d.date === day} onPress={() => setPickedDay(d.date)} />
          ))}
        </Scroller>
        <Scroller>
          <Chip label="All" pressed={library === 0} onPress={() => (setLibrary(0), setType(null))} />
          {libraries.map((l) => (
            <Chip key={l.id} label={l.name} pressed={library === l.id} onPress={() => (setLibrary(l.id), setType(null))} />
          ))}
        </Scroller>
        {types.length > 1 ? (
          <Scroller>
            {types.map((t) => (
              <Chip key={t.key} label={t.label} pressed={type === t.key} onPress={() => setType(type === t.key ? null : t.key)} />
            ))}
          </Scroller>
        ) : null}
        <ChipRow>
          {day === clock.today ? <Chip label="Free now" pressed={freeNow} onPress={() => setFreeNow(!freeNow)} /> : null}
          {ROOM_SIZES.map((s) => (
            <Chip key={s} label={s === 1 ? "1 person" : `${s}+ people`} pressed={size === s} onPress={() => setSize(s)} />
          ))}
        </ChipRow>
        {rooms.data && rooms.data.failed > 0 ? (
          <Text variant="sub" tone="text2">
            Some rooms couldn't be loaded right now.
          </Text>
        ) : null}
        {cards.length === 0 ? (
          <Card>
            <EmptyState title="No open rooms" body="Try another day, library, room type or a smaller group." />
          </Card>
        ) : (
          cards.map((r) => <RoomItem key={r.id} room={r} />)
        )}
      </ScreenState>
      <Text variant="caption" tone="text2">
        Availability from UMD Libraries' booking system, refreshed every half hour{updated}. Tap a time to open that room on that
        date on the Libraries' site, where you book with your UMD email. TurboTerp never books for you.
      </Text>
    </RefreshPage>
  );
}
