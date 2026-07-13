import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { storage } from "@/server/storage";

export const runtime = "nodejs";

const TIPOS_PERMITIDOS: Record<string, string> = {
  "video/webm": "webm",
  "video/mp4": "mp4",
};

const MAX_BYTES = 300 * 1024 * 1024; // guard generoso para un take corto

// Sube el video crudo de un take (6.3 paso 1: "Cliente sube el take").
// Requiere clipId por querystring para verificar que el usuario sea dueño
// del clip antes de aceptar el archivo — el take en sí recién se crea
// después, vía clip.subirTake, con la URL que devolvemos acá.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const clipId = req.nextUrl.searchParams.get("clipId");
  if (!clipId) {
    return NextResponse.json({ error: "Falta clipId" }, { status: 400 });
  }

  const clip = await db.clip.findUnique({
    where: { id: clipId },
    include: { interpretacion: true },
  });
  if (!clip) {
    return NextResponse.json({ error: "Clip no encontrado" }, { status: 404 });
  }
  if (clip.interpretacion.usuarioId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  const extension = TIPOS_PERMITIDOS[contentType];
  if (!extension) {
    return NextResponse.json({ error: `Content-Type no soportado: ${contentType}` }, { status: 415 });
  }

  const arrayBuffer = await req.arrayBuffer();
  if (arrayBuffer.byteLength === 0) {
    return NextResponse.json({ error: "Archivo vacío" }, { status: 400 });
  }
  if (arrayBuffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Archivo demasiado grande" }, { status: 413 });
  }

  const archivo = await storage.guardar({
    carpeta: `takes/${session.user.id}`,
    extension,
    data: Buffer.from(arrayBuffer),
    contentType,
  });

  return NextResponse.json({ url: archivo.url });
}
