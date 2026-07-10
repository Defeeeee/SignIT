import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { ColaDeRevision } from "./ColaDeRevision";

export default async function ModeracionPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.rol !== "MODERADOR" && session.user.rol !== "ADMIN") redirect("/");

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <p className="text-volt-blue font-semibold text-[13px] uppercase tracking-[0.05em] mb-3">
        Equipo
      </p>
      <h1 className="font-display text-[36px] leading-[1.0] tracking-[-0.01em] mb-2">
        Cola de revisión
      </h1>
      <p className="text-charcoal text-[15px] mb-10 max-w-xl leading-[1.5]">
        Revisión manual pre-publicación, SLA 24h. Los clips más viejos en cola aparecen primero.
      </p>
      <ColaDeRevision />
    </div>
  );
}
