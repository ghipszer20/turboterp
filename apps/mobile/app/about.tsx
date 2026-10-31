import Constants from "expo-constants";
import { Card, ListRow, Screen, Text, spacing } from "../src/ui";

export default function About() {
  return (
    <Screen title="About">
      <Card style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Text variant="headline">TurboTerp</Text>
        <Text tone="text2">Not affiliated with the University of Maryland.</Text>
      </Card>
      <Card style={{ marginTop: spacing.lg }}>
        <ListRow title="Version" subtitle={Constants.expoConfig?.version ?? "dev"} last />
      </Card>
    </Screen>
  );
}
