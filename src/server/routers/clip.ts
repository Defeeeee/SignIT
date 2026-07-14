import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "@/server/trpc";
import { processingPipeline } from "@/server/processing";
import { storage } from "@/server/storage";

const HUECO_MAX_SEGUNDOS = 10; // regla 5.1

async function assertDueño(db: typeof import("@/server/db").db, clipId: string, userId: string) {
  const clip = await db.clip.findUnique({
    where: { id: clipId },
    include: { interpretacion: true },
  });
  if (!clip) throw new TRPCError({ code: "NOT_FOUND", message: "Clip no encontrado" });
  if (clip.interpretacion.usuarioId !== userId) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return clip;
}

function assertModerador(rol: string) {
  if (rol !== "MODERADOR" && rol !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Requiere rol de moderación" });
  }
}

export const clipRouter = router({
  crear: protectedProcedure
    .input(
      z.object({
        interpretacionId: z.string(),
        tInicio: z.number().nonnegative(),
        tFin: z.number().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.tFin <= input.tInicio) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "tFin debe ser mayor a tInicio" });
      }
      const interpretacion = await ctx.db.interpretacion.findUnique({
        where: { id: input.interpretacionId },
      });
      if (!interpretacion) throw new TRPCError({ code: "NOT_FOUND" });
      if (interpretacion.usuarioId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.db.clip.create({
        data: {
          interpretacionId: input.interpretacionId,
          tInicio: input.tInicio,
          tFin: input.tFin,
        },
      });
    }),

  // 4.2.3 / editar posición del recuadro en la línea de tiempo
  mover: protectedProcedure
    .input(z.object({ clipId: z.string(), tInicio: z.number().nonnegative(), tFin: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await assertDueño(ctx.db, input.clipId, ctx.session.user.id);
      if (input.tFin <= input.tInicio) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "tFin debe ser mayor a tInicio" });
      }
      return ctx.db.clip.update({
        where: { id: input.clipId },
        data: { tInicio: input.tInicio, tFin: input.tFin },
      });
    }),

  actualizarRecuadro: protectedProcedure
    .input(
      z.object({
        clipId: z.string(),
        posX: z.number().min(0).max(1),
        posY: z.number().min(0).max(1),
        ancho: z.number().min(0.05).max(1),
        alto: z.number().min(0.05).max(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertDueño(ctx.db, input.clipId, ctx.session.user.id);
      const { clipId, ...rest } = input;
      return ctx.db.clip.update({ where: { id: clipId }, data: rest });
    }),

  // 6.3: el cliente sube un take -> pipeline de procesamiento (stub local en dev)
  subirTake: protectedProcedure
    .input(
      z.object({
        clipId: z.string(),
        archivoCrudoUrl: z.string().min(1),
        rangoInicio: z.number().nonnegative(),
        rangoFin: z.number().positive(),
        velocidadReproduccion: z.number().min(0.5).max(1).default(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const clip = await assertDueño(ctx.db, input.clipId, ctx.session.user.id);
      const interpretacion = await ctx.db.interpretacion.findUniqueOrThrow({
        where: { id: clip.interpretacionId },
      });

      const take = await ctx.db.take.create({
        data: {
          clipId: input.clipId,
          rangoInicio: input.rangoInicio,
          rangoFin: input.rangoFin,
          archivoCrudoUrl: input.archivoCrudoUrl,
          velocidadReproduccion: input.velocidadReproduccion,
        },
      });

      const resultado = await processingPipeline.procesarTake({
        takeId: take.id,
        archivoCrudoUrl: input.archivoCrudoUrl,
        modoPublicacion: interpretacion.modoPublicacion,
        rangoInicio: input.rangoInicio,
        rangoFin: input.rangoFin,
      });

      await ctx.db.$transaction([
        ctx.db.take.update({
          where: { id: take.id },
          data: { archivoRenderUrl: resultado.avatar?.avatarRenderUrl },
        }),
        ctx.db.keypoints.create({
          data: {
            takeId: take.id,
            landmarksUrl: resultado.keypoints.landmarksUrl,
            modeloVersion: resultado.keypoints.modeloVersion,
            confidenceScore: resultado.keypoints.confidenceScore,
            personaValida: resultado.keypoints.personaValida,
          },
        }),
        ...resultado.huecos.map((h) =>
          ctx.db.hueco.create({
            data: {
              clipId: input.clipId,
              tA: h.tA,
              tB: h.tB,
              estado: h.tB - h.tA > HUECO_MAX_SEGUNDOS ? "DETECTADO" : "PERMITIDO",
            },
          }),
        ),
        ctx.db.clip.update({
          where: { id: input.clipId },
          data: { estado: "BORRADOR" },
        }),
      ]);

      return ctx.db.take.findUniqueOrThrow({
        where: { id: take.id },
        include: { keypoints: true },
      });
    }),

  // borrador -> validado, solo si no quedan huecos > 10s sin resolver (regla 5.1)
  marcarValidado: protectedProcedure
    .input(z.object({ clipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const clip = await assertDueño(ctx.db, input.clipId, ctx.session.user.id);
      if (clip.estado !== "BORRADOR") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Solo un borrador puede validarse" });
      }
      const huecosAbiertos = await ctx.db.hueco.count({
        where: { clipId: input.clipId, estado: "DETECTADO" },
      });
      if (huecosAbiertos > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Hay ${huecosAbiertos} hueco(s) sin resolver (regla de huecos, máx. ${HUECO_MAX_SEGUNDOS}s)`,
        });
      }
      return ctx.db.clip.update({ where: { id: input.clipId }, data: { estado: "VALIDADO" } });
    }),

  enviarARevision: protectedProcedure
    .input(z.object({ clipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const clip = await assertDueño(ctx.db, input.clipId, ctx.session.user.id);
      if (clip.estado !== "VALIDADO") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Solo un clip validado puede enviarse a revisión" });
      }
      return ctx.db.clip.update({ where: { id: input.clipId }, data: { estado: "EN_REVISION" } });
    }),

  reintentarTrasRechazo: protectedProcedure
    .input(z.object({ clipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const clip = await assertDueño(ctx.db, input.clipId, ctx.session.user.id);
      if (clip.estado !== "RECHAZADO") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Solo un clip rechazado vuelve a borrador" });
      }
      return ctx.db.clip.update({
        where: { id: input.clipId },
        data: { estado: "BORRADOR", motivoRechazo: null },
      });
    }),

  // Borrado del propio clip, en cualquier estado — el dueño del contenido
  // puede sacarlo cuando quiera. Limpia los archivos en storage además de
  // la fila (Take/Keypoints/Hueco/etc. caen por cascade en la DB).
  eliminar: protectedProcedure
    .input(z.object({ clipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const clip = await assertDueño(ctx.db, input.clipId, ctx.session.user.id);

      const takes = await ctx.db.take.findMany({
        where: { clipId: clip.id },
        select: { archivoCrudoUrl: true, archivoRenderUrl: true },
      });

      await ctx.db.$transaction([
        ctx.db.descarga.deleteMany({ where: { clipId: clip.id } }),
        ctx.db.clip.delete({ where: { id: clip.id } }),
      ]);

      const urls = takes
        .flatMap((t) => [t.archivoCrudoUrl, t.archivoRenderUrl])
        .filter((u): u is string => !!u);
      await Promise.all(urls.map((u) => storage.borrar(u)));

      return { ok: true };
    }),

  // 3.4 Moderación MVP: revisión manual, SLA 24h
  colaDeRevision: protectedProcedure.query(({ ctx }) => {
    assertModerador(ctx.session.user.rol);
    return ctx.db.clip.findMany({
      where: { estado: "EN_REVISION" },
      orderBy: { updatedAt: "asc" },
      include: {
        interpretacion: {
          include: { video: true, usuario: { select: { handle: true, nombre: true } } },
        },
        takes: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { keypoints: true },
        },
        huecos: true,
      },
    });
  }),

  moderar: protectedProcedure
    .input(
      z.object({
        clipId: z.string(),
        decision: z.enum(["PUBLICADO", "RECHAZADO"]),
        motivo: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      assertModerador(ctx.session.user.rol);
      if (input.decision === "RECHAZADO" && !input.motivo) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "El rechazo requiere motivo" });
      }
      return ctx.db.clip.update({
        where: { id: input.clipId },
        data: { estado: input.decision, motivoRechazo: input.decision === "RECHAZADO" ? input.motivo : null },
      });
    }),

  porInterpretacion: publicProcedure
    .input(z.object({ interpretacionId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.clip.findMany({
        where: { interpretacionId: input.interpretacionId },
        orderBy: { tInicio: "asc" },
        include: { huecos: true, takes: { include: { keypoints: true } } },
      });
    }),
});
