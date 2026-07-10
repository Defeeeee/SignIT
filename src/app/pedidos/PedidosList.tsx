"use client";

import { trpc } from "@/trpc/client";

export function PedidosList() {
  const utils = trpc.useUtils();
  const { data: pedidos, isLoading } = trpc.pedido.listar.useQuery({ estado: "ABIERTO" });
  const votar = trpc.pedido.votar.useMutation({
    onSuccess: () => utils.pedido.listar.invalidate(),
  });

  if (isLoading) {
    return (
      <ul className="space-y-3">
        {[0, 1, 2].map((i) => (
          <li key={i} className="h-[68px] rounded-xl bg-mist animate-pulse" />
        ))}
      </ul>
    );
  }

  if (!pedidos || pedidos.length === 0) {
    return (
      <p className="text-charcoal text-[14px] rounded-xl border border-dashed border-ash p-6 text-center">
        No hay pedidos abiertos todavía.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {pedidos.map((p) => (
        <li
          key={p.id}
          className="rounded-xl bg-white p-4 flex items-center justify-between gap-4 shadow-[0_0_0_1px_var(--color-ash)]"
        >
          <div className="min-w-0">
            <p className="font-semibold text-[14px] truncate">{p.video?.titulo ?? p.tema}</p>
            <p className="text-[12px] text-charcoal mt-0.5">pedido por @{p.autor.handle}</p>
          </div>
          <button
            onClick={() => votar.mutate({ pedidoId: p.id })}
            disabled={votar.isPending}
            className="shrink-0 flex flex-col items-center gap-0.5 rounded-xl bg-mist px-3.5 py-1.5 transition-colors hover:bg-volt-blue/10 disabled:opacity-50"
          >
            <span className="text-volt-blue text-[11px] leading-none">▲</span>
            <span className="text-[13px] font-semibold leading-none">{p._count.votos}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
