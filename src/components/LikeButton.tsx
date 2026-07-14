"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={15}
      height={15}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-6.7-4.35-9.5-8.2C.6 9.9 1.4 6.2 4.6 4.9c2.1-.85 4.3-.1 5.5 1.6l1.9 2.6 1.9-2.6c1.2-1.7 3.4-2.45 5.5-1.6 3.2 1.3 4 5 2.1 7.9C18.7 16.65 12 21 12 21z" />
    </svg>
  );
}

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
        <HeartIcon filled={false} />
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
        toggle.mutate({ clipId });
      }}
      className={`inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors disabled:opacity-60 ${
        meGusta ? "text-volt-blue" : "text-charcoal hover:text-volt-blue"
      }`}
    >
      <HeartIcon filled={meGusta} />
      {total}
    </button>
  );
}
