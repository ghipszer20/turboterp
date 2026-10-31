import { Redirect } from "expo-router";

// The Campus tab opens on Dining; Libraries and Fitness are one tap away in the sub-nav.
export default function Campus() {
  return <Redirect href="/campus/dining" />;
}
