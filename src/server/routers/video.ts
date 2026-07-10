import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "@/server/trpc";

const videoOrigenSchema = z.enum(["YOUTUBE", "PROPIO", "CREATIVE_COMMONS"]);

export const videoRouter = router({
  // 4.4: feed simple, más recientes primero
  feed: publicProcedure
    .input(z.object({ cursor: z.string().optional(), limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const videos = await ctx.db.video.findMany({
        where: { estado: "ACTIVO" },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          _count: { select: { interpretaciones: true } },
        },
      });
      let nextCursor: string | undefined;
      if (videos.length > input.limit) {
        nextCursor = videos.pop()!.id;
      }
      return { videos, nextCursor };
    }),

  porId: publicProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.db.video.findUnique({
      where: { id: input.id },
      include: {
        interpretaciones: {
          include: {
            usuario: { select: { id: true, handle: true, nombre: true, image: true } },
            clips: { where: { estado: "PUBLICADO" }, orderBy: { tInicio: "asc" } },
          },
        },
      },
    });
  }),

  // 2/4.1: agregar un video de YouTube o CC como punto de partida de interpretación
  crear: protectedProcedure
    .input(
      z.object({
        origen: videoOrigenSchema,
        youtubeId: z.string().optional(),
        titulo: z.string().min(1).max(200),
        canal: z.string().optional(),
        duracionSegundos: z.number().int().positive(),
        categoria: z.string().optional(),
        hashtags: z.array(z.string()).default([]),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.video.create({
        data: { ...input, subidoPorId: ctx.session.user.id },
      });
    }),

  buscar: publicProcedure.input(z.object({ q: z.string().min(1) })).query(({ ctx, input }) => {
    return ctx.db.video.findMany({
      where: {
        estado: "ACTIVO",
        OR: [
          { titulo: { contains: input.q, mode: "insensitive" } },
          { hashtags: { has: input.q.toLowerCase() } },
        ],
      },
      take: 25,
    });
  }),
});
