import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  const moderador = await db.user.upsert({
    where: { handle: "moderador_demo" },
    update: {},
    create: {
      handle: "moderador_demo",
      nombre: "Moderador Demo",
      email: "moderador@signit.dev",
      rol: "MODERADOR",
      consentimientoDataset: true,
      consentimientoBiometria: true,
    },
  });

  const senante = await db.user.upsert({
    where: { handle: "sena_demo" },
    update: {},
    create: {
      handle: "sena_demo",
      nombre: "Señante Demo",
      email: "sena@signit.dev",
      rol: "USUARIO",
      senanteVerificado: true,
      region: "Buenos Aires",
      consentimientoDataset: true,
      consentimientoBiometria: true,
    },
  });

  const video = await db.video.upsert({
    where: { id: "seed-video-1" },
    update: {},
    create: {
      id: "seed-video-1",
      origen: "YOUTUBE",
      youtubeId: "dQw4w9WgXcQ",
      titulo: "Video de ejemplo para interpretar",
      canal: "Canal Demo",
      duracionSegundos: 212,
      categoria: "Entretenimiento",
      hashtags: ["demo"],
      subidoPorId: moderador.id,
    },
  });

  await db.pedido.upsert({
    where: { id: "seed-pedido-1" },
    update: {},
    create: {
      id: "seed-pedido-1",
      autorId: senante.id,
      tema: "Noticiero del mediodía con subtítulos",
    },
  });

  console.log({ moderador: moderador.handle, senante: senante.handle, video: video.titulo });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
