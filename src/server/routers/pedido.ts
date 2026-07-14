import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "@/server/trpc";

export const pedidoRouter = router({
  crear: protectedProcedure
    .input(
      z.object({
        videoId: z.string().optional(),
        tema: z.string().min(1).max(200).optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      if (!input.videoId && !input.tema) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Un pedido necesita video o tema" });
      }
      return ctx.db.pedido.create({
        data: { autorId: ctx.session.user.id, videoId: input.videoId, tema: input.tema },
      });
    }),

  // 4.5: pedidos votados, señal de demanda comunitaria
  listar: publicProcedure
    .input(z.object({ estado: z.enum(["ABIERTO", "CUMPLIDO", "CERRADO"]).default("ABIERTO") }))
    .query(async ({ ctx, input }) => {
      const pedidos = await ctx.db.pedido.findMany({
        where: { estado: input.estado },
        include: { video: true, autor: { select: { handle: true } }, _count: { select: { votos: true } } },
      });

      const votadosPorMi = ctx.session?.user
        ? new Set(
            (
              await ctx.db.pedidoVoto.findMany({
                where: { userId: ctx.session.user.id, pedidoId: { in: pedidos.map((p) => p.id) } },
                select: { pedidoId: true },
              })
            ).map((v) => v.pedidoId),
          )
        : new Set<string>();

      return pedidos
        .map((p) => ({ ...p, yaVotado: votadosPorMi.has(p.id) }))
        .sort((a, b) => b._count.votos - a._count.votos);
    }),

  votar: protectedProcedure.input(z.object({ pedidoId: z.string() })).mutation(async ({ ctx, input }) => {
    const yaVoto = await ctx.db.pedidoVoto.findUnique({
      where: { pedidoId_userId: { pedidoId: input.pedidoId, userId: ctx.session.user.id } },
    });
    if (yaVoto) {
      await ctx.db.pedidoVoto.delete({
        where: { pedidoId_userId: { pedidoId: input.pedidoId, userId: ctx.session.user.id } },
      });
      return { voto: false };
    }
    await ctx.db.pedidoVoto.create({
      data: { pedidoId: input.pedidoId, userId: ctx.session.user.id },
    });
    return { voto: true };
  }),

  vincularClip: protectedProcedure
    .input(z.object({ pedidoId: z.string(), clipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.pedidoClip.create({ data: input });
      return ctx.db.pedido.update({ where: { id: input.pedidoId }, data: { estado: "CUMPLIDO" } });
    }),
});
