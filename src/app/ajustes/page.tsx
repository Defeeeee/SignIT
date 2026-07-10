import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { AjustesForm } from "./AjustesForm";

export default async function AjustesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <p className="text-volt-blue font-semibold text-[13px] uppercase tracking-[0.05em] mb-3">
        Tu cuenta
      </p>
      <h1 className="font-display text-[36px] leading-[1.0] tracking-[-0.01em] mb-2">Ajustes</h1>
      <p className="text-charcoal text-[15px] mb-10 max-w-md leading-[1.5]">
        Perfil mínimo y consentimiento para el dataset (spec 4.1).
      </p>
      <AjustesForm />
    </div>
  );
}
