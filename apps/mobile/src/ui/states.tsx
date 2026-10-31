import type { ReactNode } from "react";
import { View } from "react-native";
import { Icon, type IconName } from "./Icon";
import { Button, Card, Skeleton } from "./primitives";
import { resolveScreenState, spacing } from "./theme";
import { Text } from "./Text";
import { useTheme } from "./useTheme";

function Message({ icon, title, body, action }: { icon: IconName; title: string; body?: string; action?: ReactNode }) {
  const { c } = useTheme();
  return (
    <Card>
      <View style={{ alignItems: "center", padding: spacing.xl, gap: spacing.sm }}>
        <Icon name={icon} size={28} color={c.text3} />
        <Text variant="headline" accessibilityRole="header" style={{ textAlign: "center" }}>
          {title}
        </Text>
        {body ? (
          <Text variant="sub" tone="text2" style={{ textAlign: "center" }}>
            {body}
          </Text>
        ) : null}
        {action ? <View style={{ marginTop: spacing.md, alignSelf: "stretch" }}>{action}</View> : null}
      </View>
    </Card>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return <Message icon="empty" title={title} body={body} />;
}

export function ErrorState({
  title = "Something went wrong",
  body = "Try again in a moment.",
  onRetry,
}: {
  title?: string;
  body?: string;
  onRetry: () => void;
}) {
  return <Message icon="warning" title={title} body={body} action={<Button label="Retry" onPress={onRetry} />} />;
}

export function OfflineState({ onRetry, cachedAge }: { onRetry: () => void; cachedAge?: string }) {
  return (
    <Message
      icon="offline"
      title="You're offline"
      body={cachedAge ? `Showing what we saved ${cachedAge}.` : "Connect to the internet to load this."}
      action={<Button label="Retry" onPress={onRetry} variant="secondary" />}
    />
  );
}

/** One place that decides what a screen shows, so none is ever blank. */
export function ScreenState({
  loading,
  offline,
  error,
  hasData,
  onRetry,
  emptyTitle = "Nothing here yet",
  children,
}: {
  loading?: boolean;
  offline?: boolean;
  error?: unknown;
  hasData?: boolean;
  onRetry: () => void;
  emptyTitle?: string;
  children: ReactNode;
}) {
  switch (resolveScreenState({ loading, offline, error, hasData })) {
    case "ready":
      return <>{children}</>;
    case "loading":
      return <Skeleton />;
    case "offline":
      return <OfflineState onRetry={onRetry} />;
    case "error":
      return <ErrorState onRetry={onRetry} />;
    default:
      return <EmptyState title={emptyTitle} />;
  }
}
