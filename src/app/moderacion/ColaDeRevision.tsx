"use client";

import { useState } from "react";
import Link from "next/link";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/trpc/client";
import type { AppRouter } from "@/server/routers/_app";
import { urlReproducible } from "@/lib/media";

type Clip = inferRouterOutputs<AppRouter>["clip"]["colaDeRevision"][number];

function horasEnCola(updatedAt: Date | string): number {
  return (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60);
}

function ClipCard({
  clip,
  onModerar,
  isPending,
}: {
  clip: Clip;
  onModerar: (input: { clipId: string; decision: "PUBLICADO" | "RECHAZADO"; motivo?: string }) => void;
  isPending: boolean;
}) {
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState("");

  const horas = horasEnCola(clip.updatedAt);
  const vencido = horas > 24;
  const confidence = clip.takes[0]?.keypoints?.confidenceScore;
  const huecosAbiertos = clip.huecos.filter((h) => h.estado === "DETECTADO").length;
  const videoUrl = urlReproducible(clip.takes[0]?.archivoRenderUrl ?? clip.takes[0]?.archivoCrudoUrl);

  return (
    <li className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_var(--color-ash)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href={`/v/${clip.interpretacion.video.id}`}
            target="_blank"
            className="font-semibold text-[15px] hover:text-volt-blue transition-colors"
          >
            {clip.interpretacion.video.titulo}
          </Link>
          <p className="text-[13px] text-charcoal mt-1">
            @{clip.interpretacion.usuario.handle} · {clip.interpretacion.modoPublicacion} ·{" "}
            {clip.tInicio.toFixed(0)}s–{clip.tFin.toFixed(0)}s
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] ${
            vencido ? "bg-volt-blue text-white" : "bg-mist text-charcoal"
          }`}
        >
          {horas < 1 ? "hace <1h" : `hace ${Math.floor(horas)}h`}
        </span>
      </div>

      {videoUrl ? (
        <video
          src={videoUrl}
          controls
          playsInline
          className="mt-4 w-full max-w-xs aspect-video rounded-lg bg-obsidian object-cover"
        />
      ) : (
        <div className="mt-4 flex w-full max-w-xs aspect-video items-center justify-center rounded-lg bg-mist text-[12px] text-charcoal">
          Sin preview disponible
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] text-charcoal">
        <span>
          Confidence:{" "}
          <span className="font-semibold text-obsidian tabular-nums">
            {confidence !== undefined ? confidence.toFixed(3) : "—"}
          </span>
        </span>
        {huecosAbiertos > 0 && (
          <span className="text-volt-blue font-medium">{huecosAbiertos} hueco(s) sin resolver</span>
        )}
      </div>

      {!rechazando ? (
        <div className="mt-5 flex gap-2.5">
          <button
            disabled={isPending}
            onClick={() => onModerar({ clipId: clip.id, decision: "PUBLICADO" })}
            className="rounded-xl bg-volt-blue text-white font-semibold px-5 py-2 text-[14px] transition-colors hover:bg-volt-blue-hover disabled:opacity-50"
          >
            Aprobar
          </button>
          <button
            disabled={isPending}
            onClick={() => setRechazando(true)}
            className="rounded-xl border border-charcoal px-5 py-2 text-[14px] font-medium transition-colors hover:bg-mist disabled:opacity-50"
          >
            Rechazar
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-2.5">
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo del rechazo (obligatorio, vuelve a borrador)"
            rows={2}
            className="w-full rounded-xl border border-charcoal bg-mist px-3.5 py-2.5 text-[14px] placeholder:text-charcoal/70 focus:outline-none focus:ring-2 focus:ring-volt-blue"
          />
          <div className="flex gap-2.5">
            <button
              disabled={isPending || !motivo.trim()}
              onClick={() => onModerar({ clipId: clip.id, decision: "RECHAZADO", motivo: motivo.trim() })}
              className="rounded-xl bg-onyx text-white font-medium px-5 py-2 text-[14px] transition-colors hover:bg-obsidian disabled:opacity-50"
            >
              Confirmar rechazo
            </button>
            <button
              disabled={isPending}
              onClick={() => {
                setRechazando(false);
                setMotivo("");
              }}
              className="rounded-xl px-5 py-2 text-[14px] font-medium text-charcoal hover:text-obsidian"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export function ColaDeRevision() {
  const utils = trpc.useUtils();
  const { data: clips, isLoading } = trpc.clip.colaDeRevision.useQuery();
  const moderar = trpc.clip.moderar.useMutation({
    onSuccess: () => utils.clip.colaDeRevision.invalidate(),
  });

  if (isLoading) {
    return (
      <ul className="space-y-3">
        {[0, 1].map((i) => (
          <li key={i} className="h-[140px] rounded-xl bg-mist animate-pulse" />
        ))}
      </ul>
    );
  }

  if (!clips || clips.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ash p-12 text-center text-charcoal">
        No hay clips esperando revisión.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {clips.map((clip) => (
        <ClipCard key={clip.id} clip={clip} onModerar={moderar.mutate} isPending={moderar.isPending} />
      ))}
    </ul>
  );
}
