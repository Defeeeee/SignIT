import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { SeguirButton } from "@/components/SeguirButton";

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          {usuario.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={usuario.image}
              alt={usuario.handle}
              className="w-16 h-16 rounded-full shadow-[0_0_0_1px_var(--color-ash)]"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-mist shadow-[0_0_0_1px_var(--color-ash)]" />
          )}
          <div>
            <h1 className="font-display text-[22px] leading-tight flex items-center gap-2">
              {usuario.nombre}
              {usuario.senanteVerificado && (
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.05em] rounded-full bg-volt-blue/10 text-volt-blue px-2.5 py-1">
                  Señante verificado
                </span>
              )}
            </h1>
            <p className="text-charcoal text-[14px] mt-1">
              @{usuario.handle} {usuario.region ? `· ${usuario.region}` : ""}
            </p>
          </div>
        </div>

        {esUnoMismo ? (
          <Link
            href="/ajustes"
            className="rounded-full border border-charcoal px-5 py-2 text-[14px] font-medium transition-colors hover:bg-mist"
          >
            Editar perfil
          </Link>
        ) : (
          <SeguirButton usuarioId={usuario.id} siguiendoInicial={siguiendoInicial} logueado={!!session?.user} />
        )}
      </div>

      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_var(--color-ash)]">
          <p className="font-display text-[28px]">{usuario._count.interpretaciones}</p>
          <p className="text-[12px] text-charcoal mt-1">interpretaciones</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_var(--color-ash)]">
          <p className="font-display text-[28px]">{usuario._count.seguidores}</p>
          <p className="text-[12px] text-charcoal mt-1">seguidores</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_var(--color-ash)]">
          <p className="font-display text-[28px]">{usuario._count.siguiendo}</p>
          <p className="text-[12px] text-charcoal mt-1">siguiendo</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_var(--color-ash)]">
          <p className="font-display text-[28px]">
            {new Date(usuario.createdAt).toLocaleDateString("es-AR", { year: "numeric", month: "short" })}
          </p>
          <p className="text-[12px] text-charcoal mt-1">se unió</p>
        </div>
      </div>
    </div>
  );
}
