import { Redirect, useIsFocused } from "expo-router";

// The Campus tab opens on Dining; Libraries and Fitness are one tap away in the sub-nav.
// Only redirects while this tab is focused, so a preloaded tab never steals the Today screen.
export default function Campus() {
  const focused = useIsFocused();
  return focused ? <Redirect href="/campus/dining" /> : null;
}
