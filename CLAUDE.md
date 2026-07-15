@AGENTS.md

# SignIT — convenciones de desarrollo y reparto del equipo

Este archivo es la fuente de verdad para cómo laburamos en este repo entre
varias personas. Actualizarlo cuando cambie el reparto o las convenciones,
no dejar que se desactualice.

## Arquitectura en una línea

Next.js 16 (App Router) + tRPC + Prisma sobre Postgres (Supabase), todo en
un solo proceso/repo. **No hay separación real de "front" y "back" como
servicios distintos** — cada feature típicamente toca un router de tRPC y
la UI que lo consume en el mismo PR. Por eso el reparto de abajo es por
**área de dominio**, no por capa.

## Flujo estándar para agregar una feature

1. Si hace falta dato nuevo: modelo/campo en `prisma/schema.prisma` +
   migración en `prisma/migrations/`.
2. Router en `src/server/routers/<nombre>.ts`, registrado en
   `src/server/routers/_app.ts`.
3. UI en `src/app/...` (páginas) o `src/components/...` (compartido).
4. Antes de pushear, los tres tienen que pasar limpios:
   ```
   npm run lint
   npx tsc --noEmit
   npx next build
   ```

## Convenciones de nombres

- Dominio (modelos, campos, routers de negocio) **en español**, siguiendo
  los términos de la spec: Usuario, Video, Interpretación, Clip, Take,
  Hueco, Pedido, etc. No traducir esto a mitad de camino.
- Nombres técnicos genéricos (utilidades, infraestructura) en inglés está
  bien (`Storage`, `ProcessingPipeline`).
- Comentarios en el código: solo cuando el *por qué* no es obvio (una
  regla de negocio no evidente, un workaround puntual). No documentar el
  *qué* — el código ya dice qué hace.

## El patrón "pluggable backend" (storage / processing)

`src/server/processing/` y `src/server/storage/` siguen el mismo patrón:
una interfaz (`types.ts`), una implementación local de desarrollo
(`local.ts`, hoy son stubs/disco local), y un factory (`index.ts`) que
elige la implementación según una env var (`PROCESSING_PROVIDER`,
`STORAGE_PROVIDER`). Cuando se conecte Azure de verdad, se agrega una
implementación nueva que cumple la misma interfaz — el código que ya la
consume (routers de `clip.ts`, etc.) no se toca. Seguir este patrón para
cualquier otra integración pesada que se sume (Whisper, avatar render).

## Migraciones sin tener `DATABASE_URL` a mano

Se puede generar el SQL de una migración nueva sin conectarse a ninguna
base (útil si estás sin acceso a la DB compartida):

```
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script
```

Esto tira el SQL completo del schema actual; compararlo contra la versión
anterior para sacar solo el diff nuevo y pegarlo a mano en
`prisma/migrations/<timestamp>_nombre/migration.sql`. `npx prisma generate`
sí funciona siempre sin DB (solo lee el schema, no se conecta a nada).

## Git

Con 3 personas en paralelo sobre el mismo repo: rama por feature
(`<nombre>/<feature>`, ej. `fede/pipeline-azure`), PR, merge — evitar
pushear directo a `main` salvo cosas realmente chicas y aisladas. Si vas a
tocar un archivo compartido grande (`schema.prisma`, `_app.ts`, `NavBar`),
avisar antes en el chat del equipo para no pisarse.

## Reparto actual

**Maxi** se encarga de todo el pipeline de ML (keypoints, avatar, Whisper,
antifraude) — es su propio track especializado, y toca este repo solo por
el borde: la interfaz en `src/server/processing/`. **Fede** tiene la carga
más alta del resto: backend y cloud ops de **la aplicación en sí** (el
website/red social), sin meterse en el pipeline de ML. **Benja** se lleva
el resto: todo el frontend que falta y lo que quede suelto.

### Maxi — pipeline de ML (keypoints / avatar / Whisper / antifraude)

Superficie de contacto con el resto del repo: `src/server/processing/`
(interfaz en `types.ts`, hoy la implementación es
`LocalFakeProcessingPipeline` en `local.ts`). Mientras la implementación
real cumpla ese contrato (`ProcessingPipeline.procesarTake`), no rompe
nada de lo que ya consume sus resultados (`clip.ts` → `subirTake`).

1. **Keypoints reales + confidence score real** (hoy es un hash
   determinístico falso).
2. **Detección de huecos real** (hoy `huecos: []` siempre, la regla 5.1
   nunca se dispara con datos reales).
3. **Whisper**: transcripción del audio original — no hay ningún campo de
   transcripción en el schema todavía, hay que agregarlo (avisar si
   afecta a algo de búsqueda, ver abajo).
4. **Avatar**: el render real (hoy `archivoRenderUrl` en modo AVATAR es
   un stub `local-fake://...` no servible — por eso hoy se muestra
   siempre el video real como fallback en toda la UI, ver
   `src/lib/media.ts:urlReproducible`).
5. **Antifraude**: el `fingerprint` que devuelve el pipeline
   (`ProcessingResult.fingerprint`) hoy se calcula pero se descarta del
   lado app — el algoritmo real es de Maxi, la persistencia/chequeo del
   lado de la app la hace Fede (ver abajo). Coordinar el formato.

### Fede — backend y cloud ops de la app (carga alta)

Todo lo que **no** es el pipeline de ML. Orden sugerido:

1. **Storage de producción**: hoy `src/server/storage/local.ts` guarda en
   disco del VPS (`UPLOADS_DIR`). Migrar a Azure Blob (o S3-compatible)
   implementando la interfaz `Storage` — no hace falta tocar nada más si
   se respeta el contrato.
2. **Descargas**: el modelo `Descarga` existe, no hay router. Implementar
   con el límite de negocio (2 cada 3hs, spec 4.4) — Benja engancha la UI
   después.
3. **Antifraude (wiring)**: persistir el `fingerprint` que devuelva el
   pipeline de Maxi (agregar el campo en `Take`/`Keypoints`) y chequear
   duplicados en `clip.subirTake`.
4. **Cuotas y TTL**: `storageUsedMb`/`storageQuotaMb` existen en `User`
   pero nada los actualiza; borradores deberían expirar a los 10 días
   inactivos (spec 2). Job/cron que lo aplique.
5. **Reportes**: el modelo `Reporte` existe, no hay router. Implementar
   crear/listar/resolver — Benja o quien tenga hueco engancha la UI.
6. **Búsqueda (backend)**: hoy es un `contains` simple sobre
   título/hashtags de `Video`. Mejorarlo (full-text real, tsvector), y
   una vez que Maxi tenga transcripciones de Whisper, indexarlas también.
7. **Ops**: deploy (`scripts/deploy.sh`, `.github/workflows/deploy.yml`),
   monitoreo/logs en el VPS, salud de la conexión a Supabase, seguridad
   general (rate limiting, hardening de auth).

### Benja — el resto: frontend + lo que queda suelto

1. **Player sincronizado en `/v/[id]`**: hoy el espectador ve el video
   de YouTube y, aparte, una grilla de clips — no hay overlay del
   intérprete *encima* del video original sincronizado en tiempo. Esto es
   el corazón visual del producto (spec 1) y todavía no existe. Cuando
   Maxi tenga el avatar real lo vas a mostrar acá también — coordinar el
   formato de reproducción con él.
2. **UI de búsqueda**: no hay ni barra de búsqueda en ningún lado.
   Arrancar contra lo que exponga Fede.
3. **UI de descargas**: botón + mensaje de límite, una vez que el router
   de Fede esté.
4. **Comentario en seña**: el schema ya soporta `TipoComentario.SENA`
   pero `comentario.crear` solo acepta texto. Reusar el patrón de
   grabación de `EstudioFlow.tsx` (MediaRecorder + upload) para grabar un
   comentario corto en señas.
5. **Modo Pictogramas/Visual** (spec 4.3): toggle de accesibilidad,
   pendiente por completo.
6. **Gate legal en registro**: checkbox de mayoría de edad + aceptación
   de ToS (spec 7 — "sin menores de 18 en el MVP").
7. Bug bash / QA mobile / estados de carga y vacío que falten / lo que
   vaya apareciendo — el catch-all.

## Estado real del proyecto (para no re-descubrir lo mismo)

- Lo que **sí** funciona end-to-end: registro/login, subir un video de
  YouTube, grabar un take con cámara real (`/estudio`), moderación manual
  con preview de video, publicación, verlo en `/v/[id]`, likes, follows,
  comentarios de texto, perfil con borrado de clips.
- Lo que es **puro stub**: el pipeline de procesamiento (keypoints/avatar
  fake), sin Whisper, sin antifraude real, sin Azure.
- Lo que **no existe todavía**: avatar renderizado, player sincronizado
  intérprete-sobre-video, búsqueda con UI, descargas, reportes, modo
  pictogramas, seña libre con colaboración comunitaria, TTL de
  borradores.
