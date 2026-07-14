"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { TrashIcon } from "@/components/icons";

export function EliminarClipButton({ clipId }: { clipId: string }) {
  const router = useRouter();
  const eliminar = trpc.clip.eliminar.useMutation({
    onSuccess: () => router.refresh(),
  });

  return (
    <button
      type="button"
      title="Eliminar clip"
      disabled={eliminar.isPending}
      onClick={() => {
        if (window.confirm("¿Eliminar este clip? No se puede deshacer.")) {
          eliminar.mutate({ clipId });
        }
      }}
      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-all hover:scale-110 hover:bg-volt-blue disabled:opacity-60"
    >
      <TrashIcon width={14} height={14} />
    </button>
  );
}
