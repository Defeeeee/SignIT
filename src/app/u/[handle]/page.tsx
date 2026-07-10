import { notFound } from "next/navigation";
import { db } from "@/server/db";

export default async function PerfilPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;

  const usuario = await db.user.findUnique({
    where: { handle },
    select: {
      handle: true,
      nombre: true,
      image: true,
      senanteVerificado: true,
      region: true,
      createdAt: true,
      _count: { select: { interpretaciones: true } },
    },
  });

  if (!usuario) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
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

      <div className="mt-10 grid grid-cols-2 gap-4 text-center">
        <div className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_var(--color-ash)]">
          <p className="font-display text-[28px]">{usuario._count.interpretaciones}</p>
          <p className="text-[12px] text-charcoal mt-1">interpretaciones</p>
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
