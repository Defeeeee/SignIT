-- CreateTable
CREATE TABLE "Follow" (
    "seguidorId" TEXT NOT NULL,
    "seguidoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("seguidorId","seguidoId")
);

-- CreateTable
CREATE TABLE "Like" (
    "usuarioId" TEXT NOT NULL,
    "clipId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("usuarioId","clipId")
);

-- CreateIndex
CREATE INDEX "Follow_seguidoId_idx" ON "Follow"("seguidoId");

-- CreateIndex
CREATE INDEX "Like_clipId_idx" ON "Like"("clipId");

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_seguidorId_fkey" FOREIGN KEY ("seguidorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_seguidoId_fkey" FOREIGN KEY ("seguidoId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "Clip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
