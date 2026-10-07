import { promises as fs } from "node:fs";
import path from "node:path";
import ImageKit from "imagekit";
import { uid } from "./types";

export interface UploadOptions {
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
  folder?: string;
  isPrivate?: boolean;
}

export interface UploadResult {
  url: string;
  fileId: string;
  filePath: string;
  name: string;
  size: number;
  isPrivate: boolean;
  provider: "imagekit" | "local";
}

let imageKitSingleton: ImageKit | null = null;

export function isImageKitConfigured(): boolean {
  return Boolean(
    process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT
  );
}

export function getImageKit(): ImageKit | null {
  if (!isImageKitConfigured()) return null;
  if (!imageKitSingleton) {
    imageKitSingleton = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY!.trim(),
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!.trim(),
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!.trim().replace(/\/$/, ""),
    });
  }
  return imageKitSingleton;
}

/**
 * Mengunggah file ke ImageKit jika dikonfigurasi, atau ke sistem berkas lokal (fallback).
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const { buffer, fileName, mimeType: _mimeType, isPrivate = false } = options;
  const ik = getImageKit();

  if (ik) {
    // Unggah ke ImageKit Cloud
    const targetFolder = options.folder
      ? options.folder
      : isPrivate
      ? "/openlynk/digital"
      : "/openlynk/media";

    const response = await ik.upload({
      file: buffer.toString("base64"),
      fileName,
      folder: targetFolder,
      isPrivateFile: Boolean(isPrivate),
      useUniqueFileName: true,
    });

    return {
      url: response.url,
      fileId: response.fileId,
      filePath: response.filePath,
      name: response.name,
      size: response.size,
      isPrivate: Boolean(isPrivate),
      provider: "imagekit",
    };
  }

  // Fallback: Simpan di disk lokal (hanya untuk dev; di production wajib ImageKit
  // karena filesystem serverless bersifat ephemeral dan file akan hilang)
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_LOCAL_UPLOADS) {
    throw new Error(
      "ImageKit belum dikonfigurasi. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, dan IMAGEKIT_URL_ENDPOINT untuk production."
    );
  }
  const ext = path.extname(fileName).slice(0, 10) || ".bin";
  const uniqueName = `${uid(isPrivate ? "dig" : "up")}${ext}`;
  const baseUploadDir = isPrivate
    ? path.join(process.cwd(), "data", "uploads", "private")
    : path.join(process.cwd(), "public", "uploads");

  await fs.mkdir(baseUploadDir, { recursive: true });
  const storedFilePath = path.join(/*turbopackIgnore: true*/ baseUploadDir, uniqueName);
  await fs.writeFile(storedFilePath, buffer);

  const localUrl = isPrivate
    ? `/api/downloads/local/${uniqueName}`
    : `/uploads/${uniqueName}`;

  return {
    url: localUrl,
    fileId: uniqueName,
    filePath: storedFilePath,
    name: fileName,
    size: buffer.length,
    isPrivate: Boolean(isPrivate),
    provider: "local",
  };
}

/**
 * Menghasilkan Expiring Signed URL untuk file digital berbayar.
 * Jika menggunakan ImageKit: token `ik-t` dan signature `ik-s` dihasilkan.
 * Durasi default: 24 jam (86.400 detik).
 */
export function generateExpiringDownloadUrl(
  filePathOrUrl: string,
  expireSeconds: number = 86400
): string {
  if (!filePathOrUrl) return "";

  const ik = getImageKit();
  if (ik) {
    const endpoint = process.env.IMAGEKIT_URL_ENDPOINT!.trim().replace(/\/$/, "");
    if (filePathOrUrl.startsWith("http://") || filePathOrUrl.startsWith("https://")) {
      // Jika URL mengarah ke ImageKit, buat signature berbasis src
      if (filePathOrUrl.startsWith(endpoint)) {
        return ik.url({
          src: filePathOrUrl,
          signed: true,
          expireSeconds,
        });
      }
      return filePathOrUrl;
    }

    // Berbasis path relatif di ImageKit
    return ik.url({
      path: filePathOrUrl.startsWith("/") ? filePathOrUrl : `/${filePathOrUrl}`,
      signed: true,
      expireSeconds,
    });
  }

  // Fallback Lokal: kembalikan URL yang tersimpan
  return filePathOrUrl;
}
