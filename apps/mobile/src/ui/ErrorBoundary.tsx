import { Component, type ErrorInfo, type ReactNode } from "react";
import { View } from "react-native";
import { reportError } from "../sentry";
import { ErrorState } from "./states";
import { spacing } from "./theme";

/** Root boundary: report to Sentry (no-op without a DSN), show Retry instead of a blank screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, info.componentStack ?? undefined);
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: spacing.lg }}>
        <ErrorState onRetry={() => this.setState({ failed: false })} />
      </View>
    );
  }
}
