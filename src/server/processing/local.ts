import crypto from "node:crypto";
import type { ProcessingPipeline, ProcessingResult, TakeInput } from "./types";

const MODELO_VERSION = "local-fake-0.1";

// Implementación local para desarrollo: no hay GPU ni Azure detrás.
// Genera resultados deterministas (a partir del takeId) para que la UI y los
// routers tengan algo consistente con qué trabajar mientras no está el worker real.
export class LocalFakeProcessingPipeline implements ProcessingPipeline {
  async procesarTake(input: TakeInput): Promise<ProcessingResult> {
    const seed = crypto.createHash("sha256").update(input.takeId).digest();
    const confidenceScore = 0.75 + (seed[0] / 255) * 0.24; // 0.75–0.99, "aprueba" por defecto en dev

    return {
      keypoints: {
        landmarksUrl: `local-fake://keypoints/${input.takeId}.json`,
        modeloVersion: MODELO_VERSION,
        confidenceScore,
        personaValida: true,
      },
      huecos: [],
      avatar:
        input.modoPublicacion === "AVATAR"
          ? { avatarRenderUrl: `local-fake://avatar/${input.takeId}.mp4` }
          : null,
      fingerprint: {
        fingerprint: seed.toString("hex").slice(0, 32),
        duplicadoDeTakeId: null,
      },
    };
  }
}
