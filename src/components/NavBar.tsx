"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import icon from "../../public/icon-signit.png";
import { HomeIcon, MegaphoneIcon, PlusCircleIcon, ShieldIcon, GearIcon, LogOutIcon } from "@/components/icons";
import { AvatarRing } from "@/components/AvatarRing";

function NavLink({
  href,
  active,
  icon: Icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: (props: { className?: string }) => React.ReactElement;
  label: string;
}) {
  return (
    <Link
      href={href}
      title={label}
      className={`group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all ${
        active ? "bg-white text-obsidian" : "text-white/70 hover:text-white hover:bg-white/10"
      }`}
    >
      <Icon className="shrink-0 transition-transform group-hover:scale-110" />
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}

export function NavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const esModerador = session?.user.rol === "MODERADOR" || session?.user.rol === "ADMIN";

  return (
    <div className="sticky top-4 z-20 px-4">
      <header className="mx-auto max-w-[1200px] rounded-full bg-obsidian shadow-[0_1px_30px_0_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between gap-6 px-3 py-2 sm:px-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src={icon} alt="" width={28} height={28} className="rounded-[7px]" />
            <span className="hidden text-white font-semibold tracking-tight text-[15px] sm:inline">
              SignIT
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <NavLink href="/" active={pathname === "/"} icon={HomeIcon} label="Videos" />
            <NavLink href="/pedidos" active={pathname === "/pedidos"} icon={MegaphoneIcon} label="Pedidos" />
            {status === "authenticated" && (
              <NavLink
                href="/estudio"
                active={pathname === "/estudio"}
                icon={PlusCircleIcon}
                label="Estudio"
              />
            )}
            {esModerador && (
              <NavLink
                href="/moderacion"
                active={pathname === "/moderacion"}
                icon={ShieldIcon}
                label="Moderación"
              />
            )}
          </nav>

          <div className="flex items-center gap-1.5 shrink-0">
            {status === "authenticated" && session.user ? (
              <>
                <Link
                  href={`/u/${session.user.handle}`}
                  title={`@${session.user.handle}`}
                  className="shrink-0 transition-transform hover:scale-105"
                >
                  <AvatarRing
                    src={session.user.image}
                    alt=""
                    size={32}
                    gap="var(--color-obsidian)"
                    fallback={session.user.handle?.[0]?.toUpperCase() ?? "?"}
                  />
                </Link>
                <Link
                  href="/ajustes"
                  title="Ajustes"
                  className={`hidden sm:flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-110 ${
                    pathname === "/ajustes" ? "bg-white text-obsidian" : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <GearIcon />
                </Link>
                <button
                  onClick={() => signOut()}
                  title="Salir"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-all hover:scale-110 hover:bg-white/10 hover:text-white"
                >
                  <LogOutIcon />
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
