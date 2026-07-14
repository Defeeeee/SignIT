"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/trpc/client";
import { CommentIcon, ArrowUpIcon } from "@/components/icons";

function tiempoRelativo(fecha: Date | string): string {
  const minutos = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
  if (minutos < 1) return "recién";
  if (minutos < 60) return `hace ${minutos}m`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas}h`;
  return `hace ${Math.floor(horas / 24)}d`;
}

function Avatar({ image, handle }: { image: string | null; handle: string }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={handle} className="h-8 w-8 rounded-full shrink-0" />;
  }
  return (
    <div className="h-8 w-8 rounded-full bg-mist shrink-0 flex items-center justify-center text-[12px] font-semibold text-charcoal">
      {handle[0]?.toUpperCase()}
    </div>
  );
}

function NuevoComentarioForm({
  videoId,
  parentId,
  onDone,
  autoFocus,
  placeholder = "Sumar un comentario...",
}: {
  videoId: string;
  parentId?: string;
  onDone?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const [texto, setTexto] = useState("");
  const utils = trpc.useUtils();
  const crear = trpc.comentario.crear.useMutation({
    onSuccess: () => {
      setTexto("");
      utils.comentario.porVideo.invalidate({ videoId });
      onDone?.();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!texto.trim()) return;
        crear.mutate({ videoId, contenidoTexto: texto.trim(), parentId });
      }}
      className="flex gap-2"
    >
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 rounded-xl border border-charcoal bg-mist px-3.5 py-2 text-[14px] placeholder:text-charcoal/70 focus:outline-none focus:ring-2 focus:ring-volt-blue"
      />
      <button
        type="submit"
        disabled={crear.isPending || !texto.trim()}
        title="Enviar"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-volt-blue text-white transition-all hover:bg-volt-blue-hover hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
      >
        <ArrowUpIcon width={16} height={16} className="rotate-90" />
      </button>
    </form>
  );
}

export function Comentarios({ videoId }: { videoId: string }) {
  const { status } = useSession();
  const { data: comentarios, isLoading } = trpc.comentario.porVideo.useQuery({ videoId });
  const [respondiendoA, setRespondiendoA] = useState<string | null>(null);

  return (
    <div className="mt-12">
      <h2 className="font-semibold text-[18px] mb-4 flex items-center gap-2">
        <CommentIcon width={18} height={18} />
        Comentarios {comentarios ? `(${comentarios.length})` : ""}
      </h2>

      {status === "authenticated" ? (
        <div className="mb-6">
          <NuevoComentarioForm videoId={videoId} />
        </div>
      ) : (
        <p className="text-charcoal text-[14px] rounded-xl bg-mist px-4 py-3 mb-6">
          Iniciá sesión para comentar.
        </p>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-mist animate-pulse" />
          ))}
        </div>
      )}

      {comentarios && comentarios.length === 0 && (
        <p className="text-charcoal text-[14px]">Todavía no hay comentarios.</p>
      )}

      <ul className="space-y-5">
        {comentarios?.map((c) => (
          <li key={c.id}>
            <div className="flex gap-3">
              <Avatar image={c.autor.image} handle={c.autor.handle} />
              <div className="flex-1 min-w-0">
                <div className="rounded-2xl bg-mist px-3.5 py-2.5 inline-block max-w-full">
                  <p className="text-[13px] font-semibold">@{c.autor.handle}</p>
                  <p className="text-[14px] mt-0.5 break-words">{c.contenidoTexto}</p>
                </div>
                <div className="flex items-center gap-3 mt-1 ml-1">
                  <span className="text-[11px] text-charcoal">{tiempoRelativo(c.createdAt)}</span>
                  {status === "authenticated" && (
                    <button
                      onClick={() => setRespondiendoA(respondiendoA === c.id ? null : c.id)}
                      className="text-[11px] font-semibold text-volt-blue"
                    >
                      Responder
                    </button>
                  )}
                </div>

                {respondiendoA === c.id && (
                  <div className="mt-2">
                    <NuevoComentarioForm
                      videoId={videoId}
                      parentId={c.id}
                      autoFocus
                      placeholder={`Responder a @${c.autor.handle}`}
                      onDone={() => setRespondiendoA(null)}
                    />
                  </div>
                )}

                {c.hijos.length > 0 && (
                  <ul className="mt-3 space-y-3 border-l-2 border-mist pl-4">
                    {c.hijos.map((h) => (
                      <li key={h.id} className="flex gap-3">
                        <Avatar image={h.autor.image} handle={h.autor.handle} />
                        <div className="min-w-0">
                          <div className="rounded-2xl bg-mist px-3.5 py-2.5 inline-block max-w-full">
                            <p className="text-[13px] font-semibold">@{h.autor.handle}</p>
                            <p className="text-[14px] mt-0.5 break-words">{h.contenidoTexto}</p>
                          </div>
                          <p className="text-[11px] text-charcoal mt-1 ml-1">{tiempoRelativo(h.createdAt)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
