// The device credential: "<deviceId>.<secret>" from POST /api/seat-alerts/device, kept in localStorage.
// Storage can throw (Safari private mode, blocked site data), so every call is guarded.

export const DEVICE_KEY = "turboterp.seatAlerts.device";

function store(storage?: Storage): Storage | null {
  try {
    return storage ?? window.localStorage;
  } catch {
    return null;
  }
}

export function loadDeviceToken(storage?: Storage): string | null {
  try {
    return store(storage)?.getItem(DEVICE_KEY) ?? null;
  } catch {
    return null;
  }
}

export function saveDeviceToken(token: string, storage?: Storage): void {
  try {
    store(storage)?.setItem(DEVICE_KEY, token);
  } catch {
    // Storage unavailable: the device re-registers next time.
  }
}

export function clearDeviceToken(storage?: Storage): void {
  try {
    store(storage)?.removeItem(DEVICE_KEY);
  } catch {
    // Nothing to clear.
  }
}
