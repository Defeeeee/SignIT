import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { storage } from "@/server/storage";

export const runtime = "nodejs";

// Sirve los archivos subidos por storage/local.ts con control de acceso:
// el take crudo de un clip es privado (spec 2: "Borrador 100% privado")
// hasta que el clip queda PUBLICADO, momento en el que pasa a ser visible
// para cualquiera (es la interpretación que ve el espectador).
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const url = `/api/media/${segments.join("/")}`;

  const take = await db.take.findFirst({
    where: { OR: [{ archivoCrudoUrl: url }, { archivoRenderUrl: url }] },
    include: { clip: { include: { interpretacion: true } } },
  });
  if (!take) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const esPublico = take.clip.estado === "PUBLICADO";
  if (!esPublico) {
    const session = await auth();
    const rol = session?.user?.rol;
    const esDueño = session?.user?.id === take.clip.interpretacion.usuarioId;
    const esModerador = rol === "MODERADOR" || rol === "ADMIN";
    if (!esDueño && !esModerador) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
  }

  const archivo = await storage.leer(url);
  if (!archivo) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(archivo.data), {
    headers: {
      "Content-Type": archivo.contentType,
      "Cache-Control": esPublico ? "public, max-age=3600" : "private, no-store",
    },
  });
}
