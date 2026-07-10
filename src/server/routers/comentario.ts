import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "@/server/trpc";

export const comentarioRouter = router({
  porVideo: publicProcedure.input(z.object({ videoId: z.string() })).query(({ ctx, input }) => {
    return ctx.db.comentario.findMany({
      where: { videoId: input.videoId, parentId: null },
      orderBy: { createdAt: "desc" },
      include: {
        autor: { select: { handle: true, nombre: true, image: true } },
        hijos: {
          orderBy: { createdAt: "asc" },
          include: { autor: { select: { handle: true, nombre: true, image: true } } },
        },
      },
    });
  }),

  crear: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        contenidoTexto: z.string().min(1).max(1000),
        parentId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const video = await ctx.db.video.findUnique({ where: { id: input.videoId } });
      if (!video) throw new TRPCError({ code: "NOT_FOUND", message: "Video no encontrado" });

      return ctx.db.comentario.create({
        data: {
          videoId: input.videoId,
          autorId: ctx.session.user.id,
          tipo: "TEXTO",
          contenidoTexto: input.contenidoTexto,
          parentId: input.parentId,
        },
        include: { autor: { select: { handle: true, nombre: true, image: true } } },
      });
    }),
});
