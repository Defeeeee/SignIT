import { db } from "@/server/db";

function slugify(base: string): string {
  const slug = base
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug.length >= 3 ? slug.slice(0, 24) : `usuario_${slug}`;
}

export async function generateUniqueHandle(seed: string): Promise<string> {
  const base = slugify(seed.split("@")[0] ?? seed);
  let candidate = base;
  let attempt = 0;

  while (await db.user.findUnique({ where: { handle: candidate }, select: { id: true } })) {
    attempt += 1;
    candidate = `${base}_${Math.random().toString(36).slice(2, 6)}`;
    if (attempt > 10) {
      candidate = `${base}_${Date.now()}`;
      break;
    }
  }

  return candidate;
}
