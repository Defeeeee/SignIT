"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";

type Paso = "video" | "interpretacion" | "clip" | "take" | "listo";

const inputClass =
  "rounded-xl border border-charcoal bg-mist px-3.5 py-2.5 text-[14px] placeholder:text-charcoal/70 focus:outline-none focus:ring-2 focus:ring-volt-blue";
const cardClass = "rounded-xl bg-white p-6 shadow-[0_0_0_1px_var(--color-ash)]";
const primaryBtn =
  "rounded-xl bg-volt-blue text-white font-semibold px-5 py-2.5 text-[14px] transition-colors hover:bg-volt-blue-hover disabled:opacity-50 disabled:cursor-not-allowed";
const secondaryBtn =
  "rounded-xl bg-onyx text-white font-medium px-5 py-2.5 text-[14px] transition-colors hover:bg-obsidian disabled:opacity-50";
const ghostBtn =
  "rounded-xl border border-charcoal px-4 py-2 text-[14px] font-medium transition-colors hover:bg-mist disabled:opacity-50";

function StepLabel({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 font-semibold text-[16px] mb-4">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-volt-blue text-white text-[12px] font-bold">
        {n}
      </span>
      {children}
    </h2>
  );
}

export function EstudioFlow() {
  const [paso, setPaso] = useState<Paso>("video");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [interpretacionId, setInterpretacionId] = useState<string | null>(null);
  const [clipId, setClipId] = useState<string | null>(null);

  const { data: feed } = trpc.video.feed.useQuery({ limit: 10 });

  const [youtubeId, setYoutubeId] = useState("");
  const [titulo, setTitulo] = useState("");
  const crearVideo = trpc.video.crear.useMutation({
    onSuccess: (v) => {
      setVideoId(v.id);
      setPaso("interpretacion");
    },
  });

  const crearInterpretacion = trpc.interpretacion.crear.useMutation({
    onSuccess: (it) => {
      setInterpretacionId(it.id);
      setPaso("clip");
    },
  });

  const [tInicio, setTInicio] = useState(0);
  const [tFin, setTFin] = useState(30);
  const crearClip = trpc.clip.crear.useMutation({
    onSuccess: (c) => {
      setClipId(c.id);
      setPaso("take");
    },
  });

  const subirTake = trpc.clip.subirTake.useMutation();
  const marcarValidado = trpc.clip.marcarValidado.useMutation();
  const enviarARevision = trpc.clip.enviarARevision.useMutation({
    onSuccess: () => setPaso("listo"),
  });

  return (
    <div className="space-y-5">
      {paso === "video" && (
        <div className={cardClass}>
          <StepLabel n={1}>Elegí un video</StepLabel>
          {feed && feed.videos.length > 0 && (
            <ul className="space-y-2 mb-5">
              {feed.videos.map((v) => (
                <li key={v.id}>
                  <button
                    onClick={() => {
                      setVideoId(v.id);
                      setPaso("interpretacion");
                    }}
                    className="text-left w-full rounded-xl bg-mist px-3.5 py-2.5 text-[14px] font-medium transition-colors hover:bg-volt-blue/10"
                  >
                    {v.titulo}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[12px] text-charcoal mb-3 uppercase tracking-[0.05em] font-medium">
            ... o cargá uno nuevo de YouTube
          </p>
          <div className="flex flex-col gap-2.5">
            <input
              placeholder="ID de YouTube"
              value={youtubeId}
              onChange={(e) => setYoutubeId(e.target.value)}
              className={inputClass}
            />
            <input
              placeholder="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={inputClass}
            />
            <button
              disabled={!youtubeId || !titulo || crearVideo.isPending}
              onClick={() =>
                crearVideo.mutate({
                  origen: "YOUTUBE",
                  youtubeId,
                  titulo,
                  duracionSegundos: 300,
                })
              }
              className={`${primaryBtn} self-start`}
            >
              Cargar video
            </button>
          </div>
        </div>
      )}

      {paso === "interpretacion" && videoId && (
        <div className={cardClass}>
          <StepLabel n={2}>Modo de publicación</StepLabel>
          <div className="flex gap-2.5">
            <button
              disabled={crearInterpretacion.isPending}
              onClick={() => crearInterpretacion.mutate({ videoId, modoPublicacion: "AVATAR" })}
              className={secondaryBtn}
            >
              Avatar
            </button>
            <button
              disabled={crearInterpretacion.isPending}
              onClick={() => crearInterpretacion.mutate({ videoId, modoPublicacion: "VIDEO_REAL" })}
              className={secondaryBtn}
            >
              Video real
            </button>
          </div>
        </div>
      )}

      {paso === "clip" && interpretacionId && (
        <div className={cardClass}>
          <StepLabel n={3}>Definí el rango del clip (segundos)</StepLabel>
          <div className="flex gap-2.5 items-center">
            <input
              type="number"
              value={tInicio}
              onChange={(e) => setTInicio(Number(e.target.value))}
              className={`w-24 ${inputClass}`}
            />
            <span className="text-charcoal text-[13px]">a</span>
            <input
              type="number"
              value={tFin}
              onChange={(e) => setTFin(Number(e.target.value))}
              className={`w-24 ${inputClass}`}
            />
            <button
              disabled={crearClip.isPending}
              onClick={() => crearClip.mutate({ interpretacionId, tInicio, tFin })}
              className={primaryBtn}
            >
              Crear clip
            </button>
          </div>
        </div>
      )}

      {paso === "take" && clipId && (
        <div className={cardClass}>
          <StepLabel n={4}>Grabación</StepLabel>
          <p className="text-[13px] text-charcoal mb-4 leading-[1.5]">
            Todavía no hay captura de cámara real conectada. Este botón simula la subida de un
            take y corre el pipeline de procesamiento (stub local de keypoints/avatar).
          </p>
          <button disabled={subirTake.isPending} onClick={() =>
              subirTake.mutate({
                clipId,
                archivoCrudoUrl: `local-fake://take/${Date.now()}.webm`,
                rangoInicio: tInicio,
                rangoFin: tFin,
              })
            } className={primaryBtn}
          >
            Simular take
          </button>

          {subirTake.data && (
            <div className="mt-5 pt-5 border-t border-ash space-y-3">
              <p className="text-[14px]">
                Confidence score:{" "}
                <span className="font-semibold text-volt-blue tabular-nums">
                  {subirTake.data.keypoints?.confidenceScore.toFixed(3)}
                </span>
              </p>
              <div className="flex gap-2.5">
                <button
                  disabled={!clipId || marcarValidado.isPending}
                  onClick={() => clipId && marcarValidado.mutate({ clipId })}
                  className={ghostBtn}
                >
                  Marcar validado
                </button>
                <button
                  disabled={!clipId || enviarARevision.isPending}
                  onClick={() => clipId && enviarARevision.mutate({ clipId })}
                  className={ghostBtn}
                >
                  Enviar a revisión
                </button>
              </div>
              {marcarValidado.error && (
                <p className="text-[12px] text-volt-blue">{marcarValidado.error.message}</p>
              )}
              {enviarARevision.error && (
                <p className="text-[12px] text-volt-blue">{enviarARevision.error.message}</p>
              )}
            </div>
          )}
        </div>
      )}

      {paso === "listo" && (
        <div className="rounded-xl bg-volt-blue/5 p-6 shadow-[0_0_0_1px_var(--color-volt-blue)]">
          <p className="text-[14px] font-medium text-obsidian">
            Clip enviado a la cola de revisión manual (SLA 24h).
          </p>
        </div>
      )}
    </div>
  );
}
