import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "@/server/trpc";

export const interpretacionRouter = router({
  crear: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        modoPublicacion: z.enum(["AVATAR", "VIDEO_REAL"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const video = await ctx.db.video.findUnique({ where: { id: input.videoId } });
      if (!video) throw new TRPCError({ code: "NOT_FOUND", message: "Video no encontrado" });

      return ctx.db.interpretacion.create({
        data: {
          videoId: input.videoId,
          usuarioId: ctx.session.user.id,
          modoPublicacion: input.modoPublicacion,
        },
      });
    }),

  porId: publicProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.db.interpretacion.findUnique({
      where: { id: input.id },
      include: {
        video: true,
        usuario: { select: { id: true, handle: true, nombre: true, image: true } },
        clips: { orderBy: { tInicio: "asc" }, include: { huecos: true } },
      },
    });
  }),

  misBorradores: protectedProcedure.query(({ ctx }) => {
    return ctx.db.interpretacion.findMany({
      where: {
        usuarioId: ctx.session.user.id,
        clips: { some: { estado: { in: ["GRABANDO", "BORRADOR", "VALIDADO", "RECHAZADO"] } } },
      },
      include: { video: true, clips: true },
      orderBy: { updatedAt: "desc" },
    });
  }),
});
