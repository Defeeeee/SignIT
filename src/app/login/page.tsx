import { signIn } from "@/server/auth";

export default function LoginPage() {
  const googleHabilitado = Boolean(process.env.AUTH_GOOGLE_ID);

  return (
    <div className="max-w-sm mx-auto mt-20 px-4">
      <div className="rounded-xl bg-white p-8 shadow-[0_0_0_1px_var(--color-ash),0_1px_20px_0_rgba(0,0,0,0.06)]">
        <p className="text-volt-blue font-semibold text-[13px] uppercase tracking-[0.05em] mb-3">
          Acceso
        </p>
        <h1 className="font-display text-[28px] leading-[1.05] tracking-[-0.01em] mb-2">
          Ingresar a SignIT
        </h1>
        <p className="text-charcoal text-[14px] mb-7">Registro con email o Google.</p>

        {googleHabilitado && (
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
            className="mb-3"
          >
            <button className="w-full rounded-xl bg-onyx text-white font-medium py-2.5 text-[14px] transition-colors hover:bg-obsidian">
              Continuar con Google
            </button>
          </form>
        )}

        <form
          action={async (formData: FormData) => {
            "use server";
            await signIn("nodemailer", { email: formData.get("email"), redirectTo: "/" });
          }}
          className="flex flex-col gap-2.5"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="tu@email.com"
            className="rounded-xl border border-charcoal bg-mist px-3.5 py-2.5 text-[14px] placeholder:text-charcoal/70 focus:outline-none focus:ring-2 focus:ring-volt-blue"
          />
          <button className="rounded-xl bg-volt-blue text-white font-semibold py-2.5 text-[14px] transition-colors hover:bg-volt-blue-hover">
            Enviar magic link
          </button>
        </form>

        {!process.env.EMAIL_SERVER && (
          <p className="mt-5 text-[12px] text-charcoal leading-[1.4]">
            Modo desarrollo: no hay EMAIL_SERVER configurado, el link de acceso se imprime en la
            consola del servidor en vez de enviarse por mail.
          </p>
        )}
      </div>
    </div>
  );
}
