"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import icon from "../../public/icon-signit.png";

const links = [
  { href: "/", label: "Videos" },
  { href: "/pedidos", label: "Pedidos" },
];

export function NavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <div className="sticky top-4 z-20 px-4">
      <header className="mx-auto max-w-[1200px] rounded-full bg-obsidian shadow-[0_1px_30px_0_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between gap-6 px-3 py-2 sm:px-5">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src={icon} alt="" width={28} height={28} className="rounded-[7px]" />
            <span className="text-white font-semibold tracking-tight text-[15px]">SignIT</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-3.5 py-1.5 text-[14px] transition-colors ${
                    active ? "bg-white/10 text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            {status === "authenticated" && (
              <Link
                href="/estudio"
                className={`rounded-full px-3.5 py-1.5 text-[14px] transition-colors ${
                  pathname === "/estudio" ? "bg-white/10 text-white" : "text-white/70 hover:text-white"
                }`}
              >
                Estudio
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {status === "authenticated" && session.user ? (
              <>
                <Link
                  href={`/u/${session.user.handle}`}
                  className="hidden md:inline text-white/70 hover:text-white text-[14px] px-2"
                >
                  @{session.user.handle}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="rounded-full bg-onyx px-4 py-1.5 text-[14px] font-medium text-white transition-colors hover:bg-white/20"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-volt-blue px-4 py-1.5 text-[14px] font-semibold text-white transition-colors hover:bg-volt-blue-hover"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
