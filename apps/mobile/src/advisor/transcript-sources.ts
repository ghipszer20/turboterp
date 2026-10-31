// The native pickers behind the import screen, each loaded on demand so a missing module (Expo Go,
// the web export) fails with a message instead of crashing. No photo-library permission is needed:
// the PDF picker and the system photo picker run out of process. Only the camera asks, using the
// purpose string in app.json, and only when the student taps "Take a photo".

export type Picked = { ok: true; base64s: string[] } | { ok: false; message: string } | { ok: "cancelled" };

const UNAVAILABLE: Picked = { ok: false, message: "That isn't available in this build of the app. Use the paste box instead." };

export async function pickPdf(): Promise<Picked> {
  try {
    const DocumentPicker = await import("expo-document-picker");
    const r = await DocumentPicker.getDocumentAsync({ type: "application/pdf", copyToCacheDirectory: true, multiple: false });
    if (r.canceled || !r.assets[0]) return { ok: "cancelled" };
    const { File } = await import("expo-file-system");
    const file = new File(r.assets[0].uri);
    const base64 = await file.base64();
    return { ok: true, base64s: [base64] };
  } catch {
    return { ok: false, message: "Couldn't open that file. Try the paste box instead." };
  }
}

import { planResize } from "./transcript-resize";

const IMAGE_OPTIONS = { mediaTypes: ["images" as const], base64: false, quality: 1, exif: false };

type PickedAsset = { uri: string; width: number; height: number };

// Resizes (when over the long-edge cap) and re-encodes as JPEG at 0.7, which also turns HEIC into JPEG.
async function toJpegBase64(a: PickedAsset): Promise<string | null> {
  const { ImageManipulator, SaveFormat } = await import("expo-image-manipulator");
  const ctx = ImageManipulator.manipulate(a.uri);
  const target = planResize(a.width, a.height);
  if (target) ctx.resize(target);
  const ref = await ctx.renderAsync();
  const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true });
  return out.base64 ?? null;
}

export async function pickPhotos(): Promise<Picked> {
  let ImagePicker: typeof import("expo-image-picker");
  try {
    ImagePicker = await import("expo-image-picker");
  } catch {
    return UNAVAILABLE;
  }
  try {
    const r = await ImagePicker.launchImageLibraryAsync({ ...IMAGE_OPTIONS, allowsMultipleSelection: true, selectionLimit: 6 });
    return await fromImages(r);
  } catch {
    return { ok: false, message: "Couldn't open your photos. Try the paste box instead." };
  }
}

export async function takePhoto(): Promise<Picked> {
  let ImagePicker: typeof import("expo-image-picker");
  try {
    ImagePicker = await import("expo-image-picker");
  } catch {
    return UNAVAILABLE;
  }
  try {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return { ok: false, message: "Camera access is off. You can turn it on in Settings, or choose a photo instead." };
    return await fromImages(await ImagePicker.launchCameraAsync(IMAGE_OPTIONS));
  } catch {
    return { ok: false, message: "Couldn't open the camera. Try choosing a photo instead." };
  }
}

async function fromImages(r: { canceled: boolean; assets?: PickedAsset[] | null }): Promise<Picked> {
  if (r.canceled || !r.assets?.length) return { ok: "cancelled" };
  const base64s: string[] = [];
  for (const a of r.assets) {
    const b = await toJpegBase64(a);
    if (b) base64s.push(b);
  }
  return base64s.length ? { ok: true, base64s } : { ok: false, message: "Couldn't read that photo. Try another." };
}
