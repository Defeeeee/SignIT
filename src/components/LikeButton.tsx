"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { HeartIcon } from "@/components/icons";

export function LikeButton({
  clipId,
  meGustaInicial,
  totalInicial,
  logueado,
}: {
  clipId: string;
  meGustaInicial: boolean;
  totalInicial: number;
  logueado: boolean;
}) {
  const [meGusta, setMeGusta] = useState(meGustaInicial);
  const [total, setTotal] = useState(totalInicial);
  const [animar, setAnimar] = useState(false);

  const toggle = trpc.like.toggle.useMutation({
    onSuccess: (data) => {
      setMeGusta(data.meGusta);
      setTotal(data.total);
    },
    onError: () => {
      setMeGusta(meGustaInicial);
      setTotal(totalInicial);
    },
  });

  if (!logueado) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-[12px] text-charcoal hover:text-volt-blue transition-colors"
      >
        <HeartIcon filled={false} width={15} height={15} />
        {total}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={toggle.isPending}
      onClick={() => {
        const proximoMeGusta = !meGusta;
        setMeGusta(proximoMeGusta);
        setTotal((t) => t + (proximoMeGusta ? 1 : -1));
        if (proximoMeGusta) {
          setAnimar(false);
          requestAnimationFrame(() => setAnimar(true));
        }
        toggle.mutate({ clipId });
      }}
      className={`inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors disabled:opacity-60 ${
        meGusta ? "text-volt-blue" : "text-charcoal hover:text-volt-blue"
      }`}
    >
      <HeartIcon
        filled={meGusta}
        width={15}
        height={15}
        className={animar ? "animate-pop" : ""}
        onAnimationEnd={() => setAnimar(false)}
      />
      {total}
    </button>
  );
}
