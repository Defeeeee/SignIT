import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v10h5v-6h2v6h5V10" />
    </Base>
  );
}

export function MegaphoneIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 10v4h3l6 4V6l-6 4H3z" />
      <path d="M14.5 9.2a4 4 0 0 1 0 5.6" />
      <path d="M17.3 6.5a8 8 0 0 1 0 11" />
    </Base>
  );
}

export function PlusCircleIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </Base>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </Base>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.5-4 5-5.5 7.5-5.5s6 1.5 7.5 5.5" />
    </Base>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2.3" />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <rect
          key={angle}
          x="10.6"
          y="2.6"
          width="2.8"
          height="2.8"
          rx="0.6"
          fill="currentColor"
          stroke="none"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </Base>
  );
}

export function LogOutIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </Base>
  );
}

export function HeartIcon({ filled, ...props }: IconProps & { filled?: boolean }) {
  return (
    <Base fill={filled ? "currentColor" : "none"} {...props}>
      <path d="M12 21s-6.7-4.35-9.5-8.2C.6 9.9 1.4 6.2 4.6 4.9c2.1-.85 4.3-.1 5.5 1.6l1.9 2.6 1.9-2.6c1.2-1.7 3.4-2.45 5.5-1.6 3.2 1.3 4 5 2.1 7.9C18.7 16.65 12 21 12 21z" />
    </Base>
  );
}

export function CommentIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4v-4H6a2 2 0 0 1-2-2V6z" />
    </Base>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="18" cy="5" r="2.3" />
      <circle cx="6" cy="12" r="2.3" />
      <circle cx="18" cy="19" r="2.3" />
      <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
    </Base>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <Base fill="currentColor" stroke="none" {...props}>
      <path d="M7 5l12 7-12 7V5z" />
    </Base>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 12l5 5 11-11" />
    </Base>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 5l14 14M19 5L5 19" />
    </Base>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13h10l1-13" />
    </Base>
  );
}

export function PersonPlusIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="10" cy="8" r="3.5" />
      <path d="M3.5 20c1.2-3.6 4.2-5 6.5-5s5.3 1.4 6.5 5" />
      <path d="M19 8v4M21 10h-4" />
    </Base>
  );
}

export function PersonCheckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="10" cy="8" r="3.5" />
      <path d="M3.5 20c1.2-3.6 4.2-5 6.5-5s5.3 1.4 6.5 5" />
      <path d="M15.5 11.3l2 2 4-4" />
    </Base>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="9" cy="9" r="3" />
      <path d="M2.5 19c1-3.2 3.6-4.5 6.5-4.5s5.5 1.3 6.5 4.5" />
      <circle cx="17.5" cy="9.5" r="2.4" />
      <path d="M15.5 14.3c2.2.2 4 1.5 4.8 4.2" />
    </Base>
  );
}

export function VideoIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="M16 10l5-3v10l-5-3" />
    </Base>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16" />
      <path d="M8 3v4M16 3v4" />
    </Base>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 6l8 7 8-7" />
    </Base>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </Base>
  );
}

export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} {...props}>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.83-.07-1.63-.2-2.4H12v4.55h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3h3.87c2.27-2.09 3.57-5.17 3.57-8.77z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.87-3.02c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.12A12 12 0 0 0 12 24z"
      />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.27a12 12 0 0 0 0 10.76z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.11C6.22 6.87 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
