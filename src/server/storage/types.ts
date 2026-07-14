// Contrato de almacenamiento de archivos (spec 6.2: "Object Storage").
// En producción esto podría apuntar a Azure Blob Storage; la implementación
// local (./local.ts) guarda en disco para desarrollo y para el VPS actual.

export interface ArchivoGuardado {
  // URL servible por la app (ej. /api/media/takes/<userId>/<uuid>.webm),
  // es lo que se persiste en Take.archivoCrudoUrl / archivoRenderUrl.
  url: string;
}

export interface Storage {
  guardar(input: {
    carpeta: string;
    extension: string;
    data: Buffer;
    contentType: string;
  }): Promise<ArchivoGuardado>;

  leer(url: string): Promise<{ data: Buffer; contentType: string } | null>;

  // No falla si el archivo ya no existe (idempotente).
  borrar(url: string): Promise<void>;
}
