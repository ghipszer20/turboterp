// Add to calendar is offered on Apple devices only (owner ruling 2026-10-30): Calendar's "Add All"
// opens a one-time .ics. Pure.

export type DeviceInfo = { userAgent: string; platform?: string; maxTouchPoints?: number };

/** iPhone, iPad (including iPadOS posing as a Mac, which has touch) and Mac: all open a .ics in Apple Calendar. */
export function isAppleDevice({ userAgent, platform = "", maxTouchPoints = 0 }: DeviceInfo): boolean {
  if (/iPhone|iPad|iPod/.test(userAgent) || /iPhone|iPad|iPod/.test(platform)) return true;
  if (maxTouchPoints > 1 && /Mac/.test(platform || userAgent)) return true;
  return /Macintosh|Mac OS X/.test(userAgent) || /^Mac/.test(platform);
}
