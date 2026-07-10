import type { ProcessingPipeline } from "./types";
import { LocalFakeProcessingPipeline } from "./local";

// PROCESSING_PROVIDER=azure conectaría acá el cliente real de Azure Queue/Service Bus
// (spec 6.2/6.3). Por ahora solo existe la implementación local de desarrollo.
function buildPipeline(): ProcessingPipeline {
  const provider = process.env.PROCESSING_PROVIDER ?? "local";
  if (provider !== "local") {
    throw new Error(`PROCESSING_PROVIDER="${provider}" no implementado todavía`);
  }
  return new LocalFakeProcessingPipeline();
}

export const processingPipeline = buildPipeline();
export type { TakeInput, ProcessingResult } from "./types";
