// El avatar WebGL todavía no está conectado (archivoRenderUrl de los takes en
// modo AVATAR es un stub "local-fake://..." no servible), así que en toda la
// UI mostramos el video real de la cámara cuando no hay nada reproducible.
export function urlReproducible(url: string | null | undefined): string | null {
  return url && url.startsWith("/api/media/") ? url : null;
}
