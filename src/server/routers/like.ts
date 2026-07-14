import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "@/server/trpc";

export const likeRouter = router({
  // Toggle: solo tiene sentido reaccionar a un clip que otros pueden ver.
  toggle: protectedProcedure
    .input(z.object({ clipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const clip = await ctx.db.clip.findUnique({ where: { id: input.clipId } });
      if (!clip) throw new TRPCError({ code: "NOT_FOUND", message: "Clip no encontrado" });
      if (clip.estado !== "PUBLICADO") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Solo se puede reaccionar a clips publicados" });
      }

      const clave = { usuarioId_clipId: { usuarioId: ctx.session.user.id, clipId: input.clipId } };
      const existente = await ctx.db.like.findUnique({ where: clave });

      if (existente) {
        await ctx.db.like.delete({ where: clave });
      } else {
        await ctx.db.like.create({ data: { usuarioId: ctx.session.user.id, clipId: input.clipId } });
      }

      const total = await ctx.db.like.count({ where: { clipId: input.clipId } });
      return { meGusta: !existente, total };
    }),
});
