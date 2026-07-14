"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/trpc/client";
import { MegaphoneIcon } from "@/components/icons";

export function NuevoPedidoForm() {
  const { status } = useSession();
  const [tema, setTema] = useState("");
  const utils = trpc.useUtils();
  const crear = trpc.pedido.crear.useMutation({
    onSuccess: () => {
      setTema("");
      utils.pedido.listar.invalidate();
    },
  });

  if (status !== "authenticated") {
    return (
      <p className="text-charcoal text-[14px] rounded-xl bg-mist px-4 py-3">
        Iniciá sesión para pedir un video o tema.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!tema.trim()) return;
        crear.mutate({ tema: tema.trim() });
      }}
      className="flex gap-2.5"
    >
      <input
        value={tema}
        onChange={(e) => setTema(e.target.value)}
        placeholder="¿Qué video o tema querés ver interpretado?"
        className="flex-1 rounded-xl border border-charcoal bg-mist px-3.5 py-2.5 text-[14px] placeholder:text-charcoal/70 focus:outline-none focus:ring-2 focus:ring-volt-blue"
      />
      <button
        type="submit"
        disabled={crear.isPending}
        className="flex items-center gap-2 rounded-xl bg-volt-blue text-white font-semibold px-5 py-2.5 text-[14px] transition-all hover:bg-volt-blue-hover hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
      >
        <MegaphoneIcon width={16} height={16} />
        Pedir
      </button>
    </form>
  );
}
