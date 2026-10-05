import { ImageResponse } from "next/og";
import { LOGO_MARK_DATA_URI } from "@/lib/logo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home-screen icon: the terrapin mark on (PRODUCT)RED. Square; iOS rounds the corners itself.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(#D0183C, #A80A29)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered to a PNG by ImageResponse, not sent to a browser */}
        <img src={LOGO_MARK_DATA_URI} width={180} height={180} alt="" />
      </div>
    ),
    size,
  );
}
