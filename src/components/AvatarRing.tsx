// Anillo tipo Instagram alrededor del avatar — mantiene la paleta del
// sistema (un solo acento azul, sin arcoíris) pero copia la silueta:
// anillo + hueco del color de fondo + avatar adentro.
export function AvatarRing({
  src,
  alt,
  size,
  gap = "var(--color-paper)",
  fallback,
}: {
  src: string | null | undefined;
  alt: string;
  size: number;
  gap?: string;
  fallback: string;
}) {
  const ring = Math.max(2, Math.round(size * 0.045));
  const hueco = Math.max(2, Math.round(size * 0.035));

  return (
    <div
      className="rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        padding: ring,
        background: "linear-gradient(135deg, var(--color-volt-blue), var(--color-volt-blue-hover))",
      }}
    >
      <div className="rounded-full h-full w-full" style={{ padding: hueco, background: gap }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="rounded-full h-full w-full object-cover" />
        ) : (
          <div className="rounded-full h-full w-full flex items-center justify-center bg-mist font-display text-charcoal">
            {fallback}
          </div>
        )}
      </div>
    </div>
  );
}
