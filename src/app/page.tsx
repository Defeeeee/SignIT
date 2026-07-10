import Image from "next/image";
import Link from "next/link";
import { db } from "@/server/db";
import { auth } from "@/server/auth";

export default async function FeedPage() {
  const [videos, session] = await Promise.all([
    db.video.findMany({
      where: { estado: "ACTIVO" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { _count: { select: { interpretaciones: true } } },
    }),
    auth(),
  ]);

  return (
    <div>
      <section className="border-b border-ash">
        <div className="max-w-[1200px] mx-auto px-4 pt-14 pb-10 sm:pt-16 sm:pb-10">
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
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <Link
              key={v.id}
              href={`/v/${v.id}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_var(--color-ash)] transition-all hover:shadow-[0_0_0_1px_var(--color-ash),0_1px_24px_0_rgba(0,0,0,0.1)] hover:-translate-y-0.5"
            >
              <div className="relative aspect-video overflow-hidden bg-mist">
                {v.origen === "YOUTUBE" && v.youtubeId ? (
                  <Image
                    src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                    alt={v.titulo}
                    fill
                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-mist to-ash">
                    <Image src="/icon-signit.png" alt="" width={40} height={40} className="rounded-[9px] opacity-40" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="font-semibold text-[16px] leading-snug line-clamp-2 group-hover:text-volt-blue transition-colors">
                  {v.titulo}
                </p>
                <p className="text-[13px] text-charcoal mt-1.5">{v.canal ?? v.origen}</p>
                <div className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-volt-blue">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-volt-blue" />
                  {v._count.interpretaciones} interpretación(es)
                </div>
              </div>
            </Link>
          ))}

          <Link
            href={session?.user ? "/estudio" : "/pedidos"}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ash p-8 text-center text-charcoal transition-colors hover:border-volt-blue hover:text-volt-blue min-h-[220px]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-current text-[18px] leading-none">
              +
            </span>
            <span className="text-[14px] font-medium">
              {session?.user ? "Cargar un video nuevo" : "Pedí un video para interpretar"}
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
