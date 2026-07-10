import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { EstudioFlow } from "./EstudioFlow";

export default async function EstudioPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <p className="text-volt-blue font-semibold text-[13px] uppercase tracking-[0.05em] mb-3">
        Estudio
      </p>
      <h1 className="font-display text-[36px] leading-[1.0] tracking-[-0.01em] mb-3">
        Estudio de grabación
      </h1>
      <p className="text-charcoal text-[15px] mb-10 max-w-xl leading-[1.5]">
        Esta versión ejercita el flujo de datos completo (interpretación → clip → take →
        pipeline de procesamiento → validación → revisión); la captura de cámara real y el
        render del avatar en WebGL todavía no están conectados.
      </p>
      <EstudioFlow />
    </div>
  );
}
