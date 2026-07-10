"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";

const PROVINCIAS = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

const inputClass =
  "rounded-xl border border-charcoal bg-mist px-3.5 py-2.5 text-[14px] placeholder:text-charcoal/70 focus:outline-none focus:ring-2 focus:ring-volt-blue disabled:opacity-60";
const cardClass = "rounded-xl bg-white p-6 shadow-[0_0_0_1px_var(--color-ash)]";
const primaryBtn =
  "rounded-xl bg-volt-blue text-white font-semibold px-5 py-2.5 text-[14px] transition-colors hover:bg-volt-blue-hover disabled:opacity-50";

function AjustesFormInner({
  initial,
}: {
  initial: {
    handle: string;
    nombre: string;
    region: string | null;
    consentimientoDataset: boolean;
    consentimientoBiometria: boolean;
  };
}) {
  const utils = trpc.useUtils();
  const [handle, setHandle] = useState(initial.handle);
  const [nombre, setNombre] = useState(initial.nombre);
  const [region, setRegion] = useState(initial.region ?? "");
  const [dataset, setDataset] = useState(initial.consentimientoDataset);
  const [biometria, setBiometria] = useState(initial.consentimientoBiometria);

  const guardarPerfil = trpc.usuario.completarPerfil.useMutation({
    onSuccess: () => utils.usuario.yo.invalidate(),
  });
  const guardarConsentimiento = trpc.usuario.aceptarConsentimientoDataset.useMutation({
    onSuccess: () => utils.usuario.yo.invalidate(),
  });

  return (
    <div className="space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          guardarPerfil.mutate({ handle, nombre, region: region || undefined });
        }}
        className={cardClass}
      >
        <h2 className="font-semibold text-[16px] mb-4">Perfil</h2>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-charcoal uppercase tracking-[0.05em]">
              Handle
            </span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase())}
              pattern="[a-z0-9_]{3,24}"
              required
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-charcoal uppercase tracking-[0.05em]">
              Nombre visible
            </span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-charcoal uppercase tracking-[0.05em]">
              Provincia / región (variación regional de LSA)
            </span>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className={inputClass}>
              <option value="">Sin especificar</option>
              {PROVINCIAS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" disabled={guardarPerfil.isPending} className={`${primaryBtn} mt-5`}>
          Guardar perfil
        </button>
        {guardarPerfil.error && (
          <p className="text-[12px] text-volt-blue mt-2">{guardarPerfil.error.message}</p>
        )}
        {guardarPerfil.isSuccess && <p className="text-[12px] text-charcoal mt-2">Guardado.</p>}
      </form>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          guardarConsentimiento.mutate({ dataset, biometria });
        }}
        className={cardClass}
      >
        <h2 className="font-semibold text-[16px] mb-1">Consentimiento del dataset</h2>
        <p className="text-[13px] text-charcoal mb-4 leading-[1.5]">
          Aceptación explícita y separada para cada uso (spec 4.1 / 7).
        </p>
        <div className="flex flex-col gap-3">
          <label className="flex items-start gap-3 text-[14px]">
            <input
              type="checkbox"
              checked={dataset}
              onChange={(e) => setDataset(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#06167c]"
            />
            <span>
              Autorizo que mi video crudo se use para construir el dataset de LSA, incluso el
              material que queda en borrador.
            </span>
          </label>
          <label className="flex items-start gap-3 text-[14px]">
            <input
              type="checkbox"
              checked={biometria}
              onChange={(e) => setBiometria(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#06167c]"
            />
            <span>
              Autorizo el uso de mis keypoints (biometría de movimiento) para el modelo base y el
              dataset.
            </span>
          </label>
        </div>
        <button
          type="submit"
          disabled={guardarConsentimiento.isPending}
          className={`${primaryBtn} mt-5`}
        >
          Guardar consentimiento
        </button>
        {guardarConsentimiento.isSuccess && (
          <p className="text-[12px] text-charcoal mt-2">Guardado.</p>
        )}
      </form>
    </div>
  );
}

export function AjustesForm() {
  const { data, isLoading } = trpc.usuario.yo.useQuery();

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <div className="h-[280px] rounded-xl bg-mist animate-pulse" />
        <div className="h-[220px] rounded-xl bg-mist animate-pulse" />
      </div>
    );
  }

  return <AjustesFormInner key={data.id} initial={data} />;
}
