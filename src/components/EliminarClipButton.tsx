"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";

export function EliminarClipButton({ clipId }: { clipId: string }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);

  const eliminar = trpc.clip.eliminar.useMutation({
    onSuccess: () => router.refresh(),
  });

  if (eliminar.isPending) {
    return <p className="text-[11px] text-charcoal">Eliminando…</p>;
  }

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="text-[11px] font-medium text-charcoal hover:text-volt-blue transition-colors"
      >
        Eliminar
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-charcoal">¿Seguro?</span>
      <button
        type="button"
        onClick={() => eliminar.mutate({ clipId })}
        className="text-[11px] font-semibold text-volt-blue"
      >
        Sí, eliminar
      </button>
      <button
        type="button"
        onClick={() => setConfirmando(false)}
        className="text-[11px] text-charcoal hover:text-obsidian"
      >
        Cancelar
      </button>
    </div>
  );
}
