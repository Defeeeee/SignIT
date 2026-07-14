import { router } from "@/server/trpc";
import { usuarioRouter } from "./usuario";
import { videoRouter } from "./video";
import { interpretacionRouter } from "./interpretacion";
import { clipRouter } from "./clip";
import { pedidoRouter } from "./pedido";
import { comentarioRouter } from "./comentario";
import { followRouter } from "./follow";
import { likeRouter } from "./like";

export const appRouter = router({
  usuario: usuarioRouter,
  video: videoRouter,
  interpretacion: interpretacionRouter,
  clip: clipRouter,
  pedido: pedidoRouter,
  comentario: comentarioRouter,
  follow: followRouter,
  like: likeRouter,
});

export type AppRouter = typeof appRouter;
