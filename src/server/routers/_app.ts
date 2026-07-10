import { router } from "@/server/trpc";
import { usuarioRouter } from "./usuario";
import { videoRouter } from "./video";
import { interpretacionRouter } from "./interpretacion";
import { clipRouter } from "./clip";
import { pedidoRouter } from "./pedido";
import { comentarioRouter } from "./comentario";

export const appRouter = router({
  usuario: usuarioRouter,
  video: videoRouter,
  interpretacion: interpretacionRouter,
  clip: clipRouter,
  pedido: pedidoRouter,
  comentario: comentarioRouter,
});

export type AppRouter = typeof appRouter;
