import { router } from "@/server/trpc";
import { usuarioRouter } from "./usuario";
import { videoRouter } from "./video";
import { interpretacionRouter } from "./interpretacion";
import { clipRouter } from "./clip";
import { pedidoRouter } from "./pedido";

export const appRouter = router({
  usuario: usuarioRouter,
  video: videoRouter,
  interpretacion: interpretacionRouter,
  clip: clipRouter,
  pedido: pedidoRouter,
});

export type AppRouter = typeof appRouter;
