import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { runSampleAudit } from "../../src/sampleAudit";

// Placeholder. Keeps the spike's audit check so the shared packages stay proven in Metro.
export default function Advisor() {
  const [out, setOut] = useState("running audit...");
  useEffect(() => {
    runSampleAudit().then(
      (s) => setOut(`${Object.values(s).filter((v) => v === "satisfied").length}/${Object.keys(s).length} satisfied`),
      (e) => setOut(`audit failed: ${String(e)}`),
    );
  }, []);
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Advisor</Text>
      <Text>{out}</Text>
    </View>
  );
}
