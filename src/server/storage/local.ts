import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ArchivoGuardado, Storage } from "./types";

const MEDIA_PREFIX = "/api/media/";

function raizUploads(): string {
  const configurado = process.env.UPLOADS_DIR;
  return configurado ? path.resolve(configurado) : path.join(process.cwd(), "data", "uploads");
}

// Solo letras/números/guiones por segmento — evita traversal vía carpeta o extensión.
function sanearSegmento(segmento: string, campo: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(segmento)) {
    throw new Error(`Segmento de ruta inválido en ${campo}: "${segmento}"`);
  }
  return segmento;
}

export class LocalDiskStorage implements Storage {
  async guardar(input: {
    carpeta: string;
    extension: string;
    data: Buffer;
    contentType: string;
  }): Promise<ArchivoGuardado> {
    const carpetaSegments = input.carpeta.split("/").map((s) => sanearSegmento(s, "carpeta"));
    const extension = sanearSegmento(input.extension, "extension");
    const nombreArchivo = `${randomUUID()}.${extension}`;

    const dirAbsoluto = path.join(raizUploads(), ...carpetaSegments);
    await mkdir(dirAbsoluto, { recursive: true });

    const rutaArchivo = path.join(dirAbsoluto, nombreArchivo);
    await writeFile(rutaArchivo, input.data);
    await writeFile(`${rutaArchivo}.meta.json`, JSON.stringify({ contentType: input.contentType }));

    const urlPath = [...carpetaSegments, nombreArchivo].join("/");
    return { url: `${MEDIA_PREFIX}${urlPath}` };
  }

  async leer(url: string): Promise<{ data: Buffer; contentType: string } | null> {
    const rutaArchivo = rutaSegura(url);
    if (!rutaArchivo) return null;

    try {
      const [data, metaRaw] = await Promise.all([
        readFile(rutaArchivo),
        readFile(`${rutaArchivo}.meta.json`, "utf-8"),
      ]);
      const meta = JSON.parse(metaRaw) as { contentType: string };
      return { data, contentType: meta.contentType };
    } catch {
      return null;
    }
  }

  async borrar(url: string): Promise<void> {
    const rutaArchivo = rutaSegura(url);
    if (!rutaArchivo) return;

    await Promise.all([
      rm(rutaArchivo, { force: true }),
      rm(`${rutaArchivo}.meta.json`, { force: true }),
    ]);
  }
}

// Resuelve la URL servible a una ruta de disco, validando que no escape la
// raíz de uploads. Devuelve null si la URL no pertenece a este storage.
function rutaSegura(url: string): string | null {
  if (!url.startsWith(MEDIA_PREFIX)) return null;
  const relativo = url.slice(MEDIA_PREFIX.length);
  const segments = relativo.split("/");
  if (segments.some((s) => !s || s === "." || s === "..")) return null;

  const raiz = raizUploads();
  const rutaArchivo = path.resolve(raiz, ...segments);
  if (!rutaArchivo.startsWith(raiz + path.sep)) return null;

  return rutaArchivo;
}
