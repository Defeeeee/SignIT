// Contrato del pipeline de procesamiento pesado (spec 6.2/6.3).
// En producción esto corre en Microsoft Azure (GPU) vía una cola de trabajos
// (Azure Queue / Service Bus). Esta interfaz es el punto de reemplazo: la
// implementación local (./local.ts) lo simula sincrónicamente para desarrollo.

export interface TakeInput {
  takeId: string;
  archivoCrudoUrl: string;
  modoPublicacion: "AVATAR" | "VIDEO_REAL";
  rangoInicio: number;
  rangoFin: number;
}

export interface KeypointsResult {
  landmarksUrl: string;
  modeloVersion: string;
  confidenceScore: number; // 0-1, spec 5.2/5.3
  personaValida: boolean; // false si detecta 0 o >1 personas en encuadre (5.3)
}

export interface HuecoDetectado {
  tA: number;
  tB: number;
}

export interface AvatarResult {
  avatarRenderUrl: string;
}

export interface FingerprintResult {
  fingerprint: string; // dedup de secuencias (5.3)
  duplicadoDeTakeId: string | null;
}

export interface ProcessingResult {
  keypoints: KeypointsResult;
  huecos: HuecoDetectado[];
  avatar: AvatarResult | null;
  fingerprint: FingerprintResult;
}

export interface ProcessingPipeline {
  procesarTake(input: TakeInput): Promise<ProcessingResult>;
}
