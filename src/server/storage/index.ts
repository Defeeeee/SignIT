import type { Storage } from "./types";
import { LocalDiskStorage } from "./local";

// STORAGE_PROVIDER=azure-blob conectaría acá el cliente real de Azure Blob
// Storage (spec 6.2). Por ahora solo existe la implementación en disco local.
function buildStorage(): Storage {
  const provider = process.env.STORAGE_PROVIDER ?? "local";
  if (provider !== "local") {
    throw new Error(`STORAGE_PROVIDER="${provider}" no implementado todavía`);
  }
  return new LocalDiskStorage();
}

export const storage = buildStorage();
export type { ArchivoGuardado, Storage } from "./types";
