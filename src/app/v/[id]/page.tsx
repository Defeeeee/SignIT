import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/server/db";
import { Comentarios } from "./Comentarios";

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const video = await db.video.findUnique({
    where: { id },
    include: {
      interpretaciones: {
        include: {
          usuario: { select: { handle: true, nombre: true } },
          clips: { where: { estado: "PUBLICADO" }, orderBy: { tInicio: "asc" } },
        },
      },
    },
  });

  if (!video) notFound();

  const duracion = video.duracionSegundos;
  const coberturaPorInterprete = video.interpretaciones.map((it) => {
    const segundosCubiertos = it.clips.reduce((acc, c) => acc + (c.tFin - c.tInicio), 0);
    return { it, pct: duracion > 0 ? Math.min(100, (segundosCubiertos / duracion) * 100) : 0 };
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <p className="text-volt-blue font-semibold text-[13px] uppercase tracking-[0.05em] mb-3">
        {video.canal ?? video.origen}
      </p>
      <h1 className="font-display text-[32px] sm:text-[40px] leading-[1.05] tracking-[-0.01em] mb-2 text-balance">
        {video.titulo}
      </h1>
      <p className="text-[14px] text-charcoal mb-8">{Math.round(duracion / 60)} min</p>

      {video.origen === "YOUTUBE" && video.youtubeId ? (
        <div className="aspect-video w-full rounded-[24px] overflow-hidden shadow-[0_0_0_1px_var(--color-ash)] mb-10">
          <iframe
            className="w-full h-full"
            // el parámetro origin es necesario: sin él YouTube no puede validar
            // el dominio embebiendo y tira Error 153 ("Watch on YouTube")
            src={`https://www.youtube.com/embed/${video.youtubeId}?origin=${encodeURIComponent(process.env.AUTH_URL ?? "http://localhost:3000")}`}
            title={video.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="aspect-video w-full rounded-[24px] border border-dashed border-ash mb-10 flex items-center justify-center text-charcoal text-sm">
          Video propio / CC — sin embed configurado
        </div>
      )}

      <h2 className="font-semibold text-[18px] mb-4">Intérpretes ({video.interpretaciones.length})</h2>
      {coberturaPorInterprete.length === 0 ? (
        <p className="text-charcoal text-[14px]">
          Nadie interpretó este video todavía.{" "}
          <Link href="/estudio" className="text-volt-blue font-medium underline underline-offset-2">
            Sé el primero
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-3">
          {coberturaPorInterprete.map(({ it, pct }) => (
            <li
              key={it.id}
              className="rounded-xl bg-white p-4 shadow-[0_0_0_1px_var(--color-ash)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[14px]">@{it.usuario.handle}</span>
                <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-charcoal">
                  {it.modoPublicacion}
                </span>
              </div>
              <div className="h-1.5 w-full bg-mist rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-volt-blue rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[12px] text-charcoal mt-1.5">
                {pct.toFixed(0)}% cubierto · {it.clips.length} clip(s) publicados
              </p>
            </li>
          ))}
        </ul>
      )}

      <Comentarios videoId={video.id} />
    </div>
  );
}
