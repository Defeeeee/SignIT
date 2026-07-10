import { PedidosList } from "./PedidosList";
import { NuevoPedidoForm } from "./NuevoPedidoForm";

export default function PedidosPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <p className="text-volt-blue font-semibold text-[13px] uppercase tracking-[0.05em] mb-3">
        Demanda comunitaria
      </p>
      <h1 className="font-display text-[36px] leading-[1.0] tracking-[-0.01em] mb-2">Pedidos</h1>
      <p className="text-charcoal text-[15px] mb-8">
        Votá los videos que querés ver interpretados.
      </p>
      <NuevoPedidoForm />
      <div className="mt-8">
        <PedidosList />
      </div>
    </div>
  );
}
