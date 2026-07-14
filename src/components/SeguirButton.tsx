"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";

const btnBase = "rounded-full px-5 py-2 text-[14px] font-semibold transition-colors disabled:opacity-60";

export function SeguirButton({
  usuarioId,
  siguiendoInicial,
  logueado,
}: {
  usuarioId: string;
  siguiendoInicial: boolean;
  logueado: boolean;
}) {
  const utils = trpc.useUtils();
  const { data } = trpc.follow.estaSiguiendo.useQuery(
    { usuarioId },
    { initialData: { siguiendo: siguiendoInicial }, enabled: logueado },
  );
  const toggle = trpc.follow.toggle.useMutation({
    onSuccess: () => utils.follow.estaSiguiendo.invalidate({ usuarioId }),
  });

  if (!logueado) {
    return (
      <Link href="/login" className={`${btnBase} bg-volt-blue text-white hover:bg-volt-blue-hover`}>
        Seguir
      </Link>
    );
  }

  const siguiendo = data?.siguiendo ?? siguiendoInicial;

  return (
    <button
      type="button"
      disabled={toggle.isPending}
      onClick={() => toggle.mutate({ usuarioId })}
      className={
        siguiendo
          ? `${btnBase} border border-charcoal text-obsidian hover:bg-mist`
          : `${btnBase} bg-volt-blue text-white hover:bg-volt-blue-hover`
      }
    >
      {siguiendo ? "Siguiendo" : "Seguir"}
    </button>
  );
}
