import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { runSampleAudit } from "../src/sampleAudit";

export default function Home() {
  const [out, setOut] = useState("running audit...");
  useEffect(() => {
    runSampleAudit().then(
      (s) => setOut(`${Object.values(s).filter((v) => v === "satisfied").length}/${Object.keys(s).length} satisfied`),
      (e) => setOut(`audit failed: ${String(e)}`),
    );
  }, []);
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>{out}</Text>
    </View>
  );
}
