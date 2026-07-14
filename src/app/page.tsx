import Image from "next/image";
import Link from "next/link";
import { db } from "@/server/db";
import { auth } from "@/server/auth";

const ORIGEN_LABEL: Record<string, string> = {
  YOUTUBE: "YouTube",
  PROPIO: "Propio",
  CREATIVE_COMMONS: "Creative Commons",
};

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-[22px] tabular-nums">{n}</span>
      <span className="text-[13px] text-charcoal">{label}</span>
    </div>
  );
}

export default async function FeedPage() {
  const [videos, session, totalVideos, totalInterpretaciones] = await Promise.all([
    db.video.findMany({
      where: { estado: "ACTIVO" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { _count: { select: { interpretaciones: true } } },
    }),
    auth(),
    db.video.count({ where: { estado: "ACTIVO" } }),
    db.interpretacion.count(),
  ]);

  const ctaHref = session?.user ? "/estudio" : "/pedidos";
  const ctaLabel = session?.user ? "Cargar un video nuevo" : "Pedí un video para interpretar";

  return (
    <div>
      <section className="relative overflow-hidden border-b border-ash">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-20 h-80 w-80 rounded-full bg-volt-blue/10 blur-3xl"
        />
        <div className="relative max-w-[1200px] mx-auto px-4 pt-14 pb-10 sm:pt-20 sm:pb-14">
          <p className="text-volt-blue font-semibold text-[13px] uppercase tracking-[0.05em] mb-4">
            Comunidad LSA
          </p>
          <h1 className="font-display text-[13vw] sm:text-[56px] leading-[0.95] tracking-[-0.02em] max-w-3xl text-balance">
            Interpretá.
            <br />
            Sumá tu seña.
          </h1>
          <p className="mt-6 max-w-md text-charcoal text-[16px] leading-[1.5]">
            Videos de YouTube y seña libre esperando intérpretes — cada take suma al dataset
            abierto de LSA.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Stat n={totalVideos} label="videos activos" />
            <Stat n={totalInterpretaciones} label="interpretaciones" />
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 py-12">
        <h2 className="font-display text-[22px] tracking-[-0.01em] mb-6">Recién subidos</h2>

        {videos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ash py-20 px-6 text-center">
            <p className="text-charcoal text-[15px] mb-5">Todavía no hay videos para interpretar.</p>
            <Link
              href={ctaHref}
              className="inline-flex rounded-full bg-volt-blue text-white font-semibold px-5 py-2.5 text-[14px] transition-colors hover:bg-volt-blue-hover"
            >
              {ctaLabel}
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <Link
                key={v.id}
                href={`/v/${v.id}`}
                className="group relative aspect-video overflow-hidden rounded-2xl bg-onyx shadow-card transition-all hover:-translate-y-0.5 hover:shadow-[0_1px_30px_0_rgba(0,0,0,0.18)]"
              >
                {v.origen === "YOUTUBE" && v.youtubeId ? (
                  <Image
                    src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                    alt={v.titulo}
                    fill
                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-onyx to-obsidian">
                    <Image src="/icon-signit.png" alt="" width={40} height={40} className="rounded-[9px] opacity-40" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.05em] text-obsidian">
                  {ORIGEN_LABEL[v.origen] ?? v.origen}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-semibold text-[15px] leading-snug line-clamp-2 text-white">
                    {v.titulo}
                  </p>
                  <p className="text-[12px] text-white/70 mt-1">{v.canal ?? v.origen}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-white">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-volt-blue" />
                    {v._count.interpretaciones} interpretación(es)
                  </div>
                </div>
              </Link>
            ))}

            <Link
              href={ctaHref}
              className="group flex aspect-video flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed border-ash text-center text-charcoal transition-colors hover:border-volt-blue hover:bg-volt-blue/5 hover:text-volt-blue"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-current text-[20px] leading-none transition-transform group-hover:scale-110">
                +
              </span>
              <span className="text-[14px] font-medium px-6">{ctaLabel}</span>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
