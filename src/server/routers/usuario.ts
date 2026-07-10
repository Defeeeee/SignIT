import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "@/server/trpc";

export const usuarioRouter = router({
  yo: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findUniqueOrThrow({ where: { id: ctx.session.user.id } });
  }),

  porHandle: publicProcedure.input(z.object({ handle: z.string() })).query(({ ctx, input }) => {
    return ctx.db.user.findUnique({
      where: { handle: input.handle },
      select: {
        id: true,
        handle: true,
        nombre: true,
        image: true,
        rol: true,
        senanteVerificado: true,
        region: true,
        createdAt: true,
      },
    });
  }),

  // 4.1: completar perfil mínimo tras el registro (handle autogenerado -> definitivo)
  completarPerfil: protectedProcedure
    .input(
      z.object({
        handle: z
          .string()
          .min(3)
          .max(24)
          .regex(/^[a-z0-9_]+$/, "solo minúsculas, números y guion bajo"),
        nombre: z.string().min(1).max(80),
        region: z.string().min(1).max(80).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existente = await ctx.db.user.findUnique({ where: { handle: input.handle } });
      if (existente && existente.id !== ctx.session.user.id) {
        throw new TRPCError({ code: "CONFLICT", message: "Ese handle ya está en uso" });
      }
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { handle: input.handle, nombre: input.nombre, region: input.region },
      });
    }),

  aceptarConsentimientoDataset: protectedProcedure
    .input(z.object({ dataset: z.boolean(), biometria: z.boolean() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          consentimientoDataset: input.dataset,
          consentimientoBiometria: input.biometria,
        },
      });
    }),
});
