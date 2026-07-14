import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "@/server/trpc";

export const followRouter = router({
  toggle: protectedProcedure
    .input(z.object({ usuarioId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.usuarioId === ctx.session.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No podés seguirte a vos mismo" });
      }

      const clave = { seguidorId_seguidoId: { seguidorId: ctx.session.user.id, seguidoId: input.usuarioId } };
      const existente = await ctx.db.follow.findUnique({ where: clave });

      if (existente) {
        await ctx.db.follow.delete({ where: clave });
        return { siguiendo: false };
      }

      const usuario = await ctx.db.user.findUnique({ where: { id: input.usuarioId } });
      if (!usuario) throw new TRPCError({ code: "NOT_FOUND", message: "Usuario no encontrado" });

      await ctx.db.follow.create({
        data: { seguidorId: ctx.session.user.id, seguidoId: input.usuarioId },
      });
      return { siguiendo: true };
    }),

  estaSiguiendo: publicProcedure
    .input(z.object({ usuarioId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session?.user) return { siguiendo: false };
      const existente = await ctx.db.follow.findUnique({
        where: {
          seguidorId_seguidoId: { seguidorId: ctx.session.user.id, seguidoId: input.usuarioId },
        },
      });
      return { siguiendo: !!existente };
    }),
});
