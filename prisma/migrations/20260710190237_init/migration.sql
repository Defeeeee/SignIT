-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('USUARIO', 'MODERADOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "VideoOrigen" AS ENUM ('YOUTUBE', 'PROPIO', 'CREATIVE_COMMONS');

-- CreateEnum
CREATE TYPE "VideoEstado" AS ENUM ('ACTIVO', 'HUERFANO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "ModoPublicacion" AS ENUM ('AVATAR', 'VIDEO_REAL');

-- CreateEnum
CREATE TYPE "ClipEstado" AS ENUM ('GRABANDO', 'BORRADOR', 'VALIDADO', 'EN_REVISION', 'PUBLICADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "HuecoEstado" AS ENUM ('DETECTADO', 'PERMITIDO', 'RESUELTO');

-- CreateEnum
CREATE TYPE "PedidoEstado" AS ENUM ('ABIERTO', 'CUMPLIDO', 'CERRADO');

-- CreateEnum
CREATE TYPE "TipoComentario" AS ENUM ('TEXTO', 'SENA');

-- CreateEnum
CREATE TYPE "ReporteEstado" AS ENUM ('ABIERTO', 'EN_REVISION', 'RESUELTO', 'DESESTIMADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "rol" "Rol" NOT NULL DEFAULT 'USUARIO',
    "senanteVerificado" BOOLEAN NOT NULL DEFAULT false,
    "region" TEXT,
    "storageUsedBytes" BIGINT NOT NULL DEFAULT 0,
    "storageQuotaBytes" BIGINT NOT NULL DEFAULT 21474836480,
    "consentimientoDataset" BOOLEAN NOT NULL DEFAULT false,
    "consentimientoBiometria" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "origen" "VideoOrigen" NOT NULL,
    "youtubeId" TEXT,
    "archivoUrl" TEXT,
    "titulo" TEXT NOT NULL,
    "canal" TEXT,
    "duracionSegundos" INTEGER NOT NULL,
    "categoria" TEXT,
    "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "idioma" TEXT NOT NULL DEFAULT 'es',
    "estado" "VideoEstado" NOT NULL DEFAULT 'ACTIVO',
    "subidoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interpretacion" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "modoPublicacion" "ModoPublicacion" NOT NULL,
    "coberturaAgregada" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interpretacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clip" (
    "id" TEXT NOT NULL,
    "interpretacionId" TEXT NOT NULL,
    "tInicio" DOUBLE PRECISION NOT NULL,
    "tFin" DOUBLE PRECISION NOT NULL,
    "estado" "ClipEstado" NOT NULL DEFAULT 'GRABANDO',
    "posX" DOUBLE PRECISION NOT NULL DEFAULT 0.75,
    "posY" DOUBLE PRECISION NOT NULL DEFAULT 0.65,
    "ancho" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "alto" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "vistas" INTEGER NOT NULL DEFAULT 0,
    "motivoRechazo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Take" (
    "id" TEXT NOT NULL,
    "clipId" TEXT NOT NULL,
    "rangoInicio" DOUBLE PRECISION NOT NULL,
    "rangoFin" DOUBLE PRECISION NOT NULL,
    "archivoCrudoUrl" TEXT NOT NULL,
    "archivoRenderUrl" TEXT,
    "velocidadReproduccion" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "syncOffsetMs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Take_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keypoints" (
    "id" TEXT NOT NULL,
    "takeId" TEXT NOT NULL,
    "landmarksUrl" TEXT NOT NULL,
    "modeloVersion" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "personaValida" BOOLEAN NOT NULL DEFAULT true,
    "flagsActividad" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Keypoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hueco" (
    "id" TEXT NOT NULL,
    "clipId" TEXT NOT NULL,
    "tA" DOUBLE PRECISION NOT NULL,
    "tB" DOUBLE PRECISION NOT NULL,
    "estado" "HuecoEstado" NOT NULL DEFAULT 'DETECTADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hueco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "videoId" TEXT,
    "tema" TEXT,
    "estado" "PedidoEstado" NOT NULL DEFAULT 'ABIERTO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoVoto" (
    "pedidoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PedidoVoto_pkey" PRIMARY KEY ("pedidoId","userId")
);

-- CreateTable
CREATE TABLE "PedidoClip" (
    "pedidoId" TEXT NOT NULL,
    "clipId" TEXT NOT NULL,

    CONSTRAINT "PedidoClip_pkey" PRIMARY KEY ("pedidoId","clipId")
);

-- CreateTable
CREATE TABLE "Comentario" (
    "id" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "videoId" TEXT,
    "clipId" TEXT,
    "tipo" "TipoComentario" NOT NULL,
    "contenidoTexto" TEXT,
    "contenidoVideoUrl" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Descarga" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "clipId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Descarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reporte" (
    "id" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "videoId" TEXT,
    "clipId" TEXT,
    "motivo" TEXT NOT NULL,
    "estado" "ReporteEstado" NOT NULL DEFAULT 'ABIERTO',
    "resolucionNota" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_handle_key" ON "usuarios"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Video_estado_idx" ON "Video"("estado");

-- CreateIndex
CREATE INDEX "Interpretacion_videoId_idx" ON "Interpretacion"("videoId");

-- CreateIndex
CREATE INDEX "Interpretacion_usuarioId_idx" ON "Interpretacion"("usuarioId");

-- CreateIndex
CREATE INDEX "Clip_interpretacionId_idx" ON "Clip"("interpretacionId");

-- CreateIndex
CREATE INDEX "Clip_estado_idx" ON "Clip"("estado");

-- CreateIndex
CREATE INDEX "Take_clipId_idx" ON "Take"("clipId");

-- CreateIndex
CREATE UNIQUE INDEX "Keypoints_takeId_key" ON "Keypoints"("takeId");

-- CreateIndex
CREATE INDEX "Hueco_clipId_idx" ON "Hueco"("clipId");

-- CreateIndex
CREATE INDEX "Pedido_estado_idx" ON "Pedido"("estado");

-- CreateIndex
CREATE INDEX "Comentario_videoId_idx" ON "Comentario"("videoId");

-- CreateIndex
CREATE INDEX "Comentario_clipId_idx" ON "Comentario"("clipId");

-- CreateIndex
CREATE INDEX "Descarga_usuarioId_createdAt_idx" ON "Descarga"("usuarioId", "createdAt");

-- CreateIndex
CREATE INDEX "Reporte_estado_idx" ON "Reporte"("estado");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interpretacion" ADD CONSTRAINT "Interpretacion_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interpretacion" ADD CONSTRAINT "Interpretacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clip" ADD CONSTRAINT "Clip_interpretacionId_fkey" FOREIGN KEY ("interpretacionId") REFERENCES "Interpretacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Take" ADD CONSTRAINT "Take_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "Clip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keypoints" ADD CONSTRAINT "Keypoints_takeId_fkey" FOREIGN KEY ("takeId") REFERENCES "Take"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hueco" ADD CONSTRAINT "Hueco_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "Clip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoVoto" ADD CONSTRAINT "PedidoVoto_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoVoto" ADD CONSTRAINT "PedidoVoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoClip" ADD CONSTRAINT "PedidoClip_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoClip" ADD CONSTRAINT "PedidoClip_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "Clip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "Clip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comentario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Descarga" ADD CONSTRAINT "Descarga_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Descarga" ADD CONSTRAINT "Descarga_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "Clip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "Clip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
