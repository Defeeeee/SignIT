import Link from "next/link";

export default function VerificarEmailPage() {
  return (
    <div className="max-w-sm mx-auto mt-20 px-4">
      <div className="rounded-xl bg-white p-8 text-center shadow-[0_0_0_1px_var(--color-ash),0_1px_20px_0_rgba(0,0,0,0.06)]">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-volt-blue/10">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#06167c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16v16H4z" opacity="0" />
            <path d="M22 6l-10 7L2 6" />
            <path d="M2 6h20v12H2z" />
          </svg>
        </div>
        <p className="text-volt-blue font-semibold text-[13px] uppercase tracking-[0.05em] mb-3">
          Casi listo
        </p>
        <h1 className="font-display text-[24px] leading-[1.1] tracking-[-0.01em] mb-2">
          Revisá tu email
        </h1>
        <p className="text-charcoal text-[14px] leading-[1.5]">
          Te mandamos un link para entrar a SignIT. Abrilo desde este mismo dispositivo.
        </p>
        <p className="text-charcoal text-[13px] leading-[1.5] mt-4">
          ¿No te llegó? Revisá spam, o{" "}
          <Link href="/login" className="text-volt-blue font-medium underline underline-offset-2">
            pedí otro link
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
