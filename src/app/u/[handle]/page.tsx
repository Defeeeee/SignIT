import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { SeguirButton } from "@/components/SeguirButton";
import { EliminarClipButton } from "@/components/EliminarClipButton";
import { LikeButton } from "@/components/LikeButton";
import { urlReproducible } from "@/lib/media";
import { VideoIcon, UsersIcon, PersonPlusIcon, CalendarIcon, CheckIcon, GearIcon } from "@/components/icons";

const ESTADO_LABEL: Record<string, string> = {
  GRABANDO: "Grabando",
  BORRADOR: "Borrador",
  VALIDADO: "Validado",
  EN_REVISION: "En revisión",
  PUBLICADO: "Publicado",
  RECHAZADO: "Rechazado",
};

function StatCard({ icon: Icon, value, label }: { icon: (p: { className?: string }) => React.ReactElement; value: string | number; label: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-[0_0_0_1px_var(--color-ash)] transition-shadow hover:shadow-[0_0_0_1px_var(--color-ash),0_1px_16px_0_rgba(0,0,0,0.06)]">
      <Icon className="text-volt-blue mb-2" />
      <p className="font-display text-[24px] leading-none">{value}</p>
      <p className="text-[11px] text-charcoal mt-1.5">{label}</p>
    </div>
  );
}

export default async function PerfilPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;

  const [usuario, session] = await Promise.all([
    db.user.findUnique({
      where: { handle },
      select: {
        id: true,
        handle: true,
        nombre: true,
        image: true,
        senanteVerificado: true,
        region: true,
        createdAt: true,
        _count: { select: { interpretaciones: true, seguidores: true, siguiendo: true } },
      },
    }),
    auth(),
  ]);

  if (!usuario) notFound();

  const esUnoMismo = session?.user?.id === usuario.id;
  const siguiendoInicial =
    !esUnoMismo && session?.user
      ? Boolean(
          await db.follow.findUnique({
            where: { seguidorId_seguidoId: { seguidorId: session.user.id, seguidoId: usuario.id } },
          }),
        )
      : false;

  // El dueño ve todos sus clips (incluidos borradores/rechazados, spec 2:
  // "borrador 100% privado"); cualquier otro visitante solo ve lo publicado.
  const clips = await db.clip.findMany({
    where: {
      interpretacion: { usuarioId: usuario.id },
      ...(esUnoMismo ? {} : { estado: "PUBLICADO" }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      interpretacion: { include: { video: { select: { id: true, titulo: true } } } },
      _count: { select: { likes: true } },
      takes: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { archivoCrudoUrl: true, archivoRenderUrl: true },
      },
    },
  });

  const clipIdsLikeados = session?.user
    ? new Set(
        (
          await db.like.findMany({
            where: { usuarioId: session.user.id, clipId: { in: clips.map((c) => c.id) } },
            select: { clipId: true },
          })
        ).map((l) => l.clipId),
      )
    : new Set<string>();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {usuario.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={usuario.image}
                alt={usuario.handle}
                className="w-16 h-16 rounded-full ring-2 ring-volt-blue/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-mist ring-2 ring-volt-blue/20 flex items-center justify-center font-display text-[22px] text-charcoal">
                {usuario.nombre[0]?.toUpperCase()}
              </div>
            )}
            {usuario.senanteVerificado && (
              <span className="absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-volt-blue text-white ring-2 ring-paper">
                <CheckIcon width={11} height={11} strokeWidth={3} />
              </span>
            )}
          </div>
          <div>
            <h1 className="font-display text-[22px] leading-tight">{usuario.nombre}</h1>
            <p className="text-charcoal text-[14px] mt-1">
              @{usuario.handle} {usuario.region ? `· ${usuario.region}` : ""}
            </p>
          </div>
        </div>

        {esUnoMismo ? (
          <Link
            href="/ajustes"
            className="flex items-center gap-2 rounded-full border border-charcoal px-5 py-2 text-[14px] font-medium transition-colors hover:bg-mist"
          >
            <GearIcon width={16} height={16} />
            Editar perfil
          </Link>
        ) : (
          <SeguirButton usuarioId={usuario.id} siguiendoInicial={siguiendoInicial} logueado={!!session?.user} />
        )}
      </div>

      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={VideoIcon} value={usuario._count.interpretaciones} label="interpretaciones" />
        <StatCard icon={UsersIcon} value={usuario._count.seguidores} label="seguidores" />
        <StatCard icon={PersonPlusIcon} value={usuario._count.siguiendo} label="siguiendo" />
        <StatCard
          icon={CalendarIcon}
          value={new Date(usuario.createdAt).toLocaleDateString("es-AR", { year: "numeric", month: "short" })}
          label="se unió"
        />
      </div>

      <h2 className="font-semibold text-[16px] mt-12 mb-4">
        {esUnoMismo ? "Mis clips" : "Clips publicados"}
      </h2>
      {clips.length === 0 ? (
        <p className="text-charcoal text-[14px]">
          {esUnoMismo ? (
            <>
              Todavía no grabaste nada.{" "}
              <Link href="/estudio" className="text-volt-blue font-medium underline underline-offset-2">
                Arrancá en el estudio
              </Link>
              .
            </>
          ) : (
            "Todavía no publicó ningún clip."
          )}
        </p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {clips.map((c) => {
            const videoUrl = urlReproducible(c.takes[0]?.archivoRenderUrl ?? c.takes[0]?.archivoCrudoUrl);
            return (
              <li key={c.id} className="group">
                <div className="relative overflow-hidden rounded-lg bg-obsidian">
                  {videoUrl ? (
                    <video src={videoUrl} controls playsInline className="w-full aspect-video object-cover" />
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-mist text-[11px] text-charcoal text-center px-2">
                      Sin preview disponible
                    </div>
                  )}
                  <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/60 backdrop-blur px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-white">
                    {ESTADO_LABEL[c.estado] ?? c.estado}
                  </span>
                  {esUnoMismo && (
                    <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <EliminarClipButton clipId={c.id} />
                    </div>
                  )}
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <Link
                    href={`/v/${c.interpretacion.video.id}`}
                    className="text-[11px] text-charcoal hover:text-volt-blue transition-colors truncate"
                  >
                    {c.interpretacion.video.titulo}
                  </Link>
                  <LikeButton
                    clipId={c.id}
                    meGustaInicial={clipIdsLikeados.has(c.id)}
                    totalInicial={c._count.likes}
                    logueado={!!session?.user}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
