import { NextResponse } from "next/server";
import path from "node:path";
import { isAdmin, getSessionUser } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DIGITAL_SIZE = 25 * 1024 * 1024; // 25 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/epub+zip",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".gif",
  ".pdf",
  ".zip",
  ".epub",
]);

export async function POST(req: Request) {
  // Hanya kreator terautentikasi atau admin dengan ADMIN_TOKEN yang boleh mengunggah berkas
  const user = await getSessionUser(req);
  const adminAllowed = Boolean(process.env.ADMIN_TOKEN) && isAdmin(req);
  if (!user && !adminAllowed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file wajib diisi" }, { status: 400 });
  }

  const kind = String(form.get("kind") || "");
  const isPrivateExplicit = form.get("isPrivate") === "true";
  const isDigital = kind === "digital" || file.type === "application/pdf" || file.type.includes("zip");
  const isPrivate = isPrivateExplicit || isDigital;

  const maxSize = isDigital ? MAX_DIGITAL_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    const limitMb = Math.round(maxSize / (1024 * 1024));
    return NextResponse.json({ error: `Ukuran file melebihi batas maksimal ${limitMb}MB` }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (file.name && !ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: `Ekstensi file ${ext || "tanpa ekstensi"} tidak didukung demi keamanan.` },
      { status: 400 }
    );
  }

  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: `Tipe file ${file.type} tidak didukung` }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadFile({
      buffer,
      fileName: file.name,
      mimeType: file.type,
      isPrivate,
    });

    return NextResponse.json(
      {
        url: result.url,
        fileId: result.fileId,
        filePath: result.filePath,
        name: result.name,
        size: result.size,
        provider: result.provider,
        isPrivate: result.isPrivate,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengunggah file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
