import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/server/db";
import { generateUniqueHandle } from "@/server/handle";

const providers = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

providers.push(
  Nodemailer({
    // placeholder: no se usa (ver sendVerificationRequest), pero el provider exige el campo
    server: process.env.EMAIL_SERVER || "smtp://localhost:1025",
    from: process.env.EMAIL_FROM,
    // Sin EMAIL_SERVER configurado (dev), logueamos el magic link en vez de
    // enviarlo por SMTP real, para poder probar el login por email localmente.
    async sendVerificationRequest({ identifier, url }) {
      if (!process.env.EMAIL_SERVER) {
        console.log(`\n[dev] Magic link para ${identifier}:\n${url}\n`);
        return;
      }
      const { createTransport } = await import("nodemailer");
      const transport = createTransport(process.env.EMAIL_SERVER);
      await transport.sendMail({
        to: identifier,
        from: process.env.EMAIL_FROM,
        subject: "Iniciar sesión en SignIT",
        text: `Ingresá a SignIT: ${url}`,
        html: `<p><a href="${url}">Ingresar a SignIT</a></p>`,
      });
    },
  }),
);

const baseAdapter = PrismaAdapter(db);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: {
    ...baseAdapter,
    // el adapter estándar solo manda { name, email, emailVerified, image };
    // acá completamos handle/nombre (spec 4.1: "Perfil mínimo: handle, nombre visible")
    // con un handle autogenerado que el usuario puede editar en onboarding.
    createUser: async (data) => {
      const handle = await generateUniqueHandle(data.email ?? "usuario");
      return db.user.create({
        data: {
          email: data.email,
          emailVerified: data.emailVerified,
          image: data.image,
          nombre: data.name ?? handle,
          handle,
        },
      });
    },
  },
  providers,
  trustHost: true, // detrás de Traefik en producción; confía en X-Forwarded-Host
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      const dbUser = user as unknown as { handle: string; rol: string };
      session.user.id = user.id;
      session.user.handle = dbUser.handle;
      session.user.rol = dbUser.rol;
      return session;
    },
  },
});
