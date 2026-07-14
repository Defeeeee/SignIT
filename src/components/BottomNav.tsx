"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { HomeIcon, MegaphoneIcon, PlusCircleIcon, UserIcon } from "@/components/icons";
import { AvatarRing } from "@/components/AvatarRing";

// Nav inferior estilo Instagram, solo en mobile — la pill nav de arriba
// (NavBar) se ocupa de todo en desktop.
function Item({
  href,
  active,
  icon: Icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: (props: { width?: number; height?: number; className?: string }) => React.ReactElement;
  label: string;
}) {
  return (
    <Link href={href} className="flex flex-1 flex-col items-center gap-1 py-2.5">
      <Icon width={23} height={23} className={active ? "text-obsidian" : "text-charcoal/70"} />
      <span className={`text-[10px] font-medium ${active ? "text-obsidian" : "text-charcoal/70"}`}>
        {label}
      </span>
    </Link>
  );
}

export function BottomNav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-t border-ash pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch max-w-[1200px] mx-auto">
        <Item href="/" active={pathname === "/"} icon={HomeIcon} label="Videos" />
        <Item href="/pedidos" active={pathname === "/pedidos"} icon={MegaphoneIcon} label="Pedidos" />

        <Link href="/estudio" className="flex flex-1 flex-col items-center justify-center">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              pathname === "/estudio" ? "bg-volt-blue text-white" : "bg-mist text-obsidian"
            }`}
          >
            <PlusCircleIcon width={22} height={22} />
          </span>
        </Link>

        {status === "authenticated" && session.user ? (
          <Link href={`/u/${session.user.handle}`} className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5">
            <AvatarRing
              src={session.user.image}
              alt=""
              size={22}
              gap="var(--color-paper)"
              fallback={session.user.handle?.[0]?.toUpperCase() ?? "?"}
            />
            <span className={`text-[10px] font-medium ${pathname.startsWith("/u/") ? "text-obsidian" : "text-charcoal/70"}`}>
              Perfil
            </span>
          </Link>
        ) : (
          <Item href="/login" active={pathname === "/login"} icon={UserIcon} label="Ingresar" />
        )}
      </div>
    </nav>
  );
}
