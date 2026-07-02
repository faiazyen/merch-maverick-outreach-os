"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BrainCircuit,
  Radar,
  PenLine,
  Send,
  Settings,
  Zap,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/brain", label: "Market Brain", icon: BrainCircuit },
  { href: "/radar", label: "Radar", icon: Radar },
  { href: "/writer", label: "Ghostwriter", icon: PenLine },
  { href: "/queue", label: "Queue", icon: Send },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login") return <>{children}</>;

  return (
    <div className="flex min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-56 flex-col border-r border-[--color-border] bg-[--color-surface]">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[--color-accent] text-[#04150e]">
            <Zap size={16} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Outreach OS</p>
            <p className="mono text-[10px] uppercase tracking-wider text-[--color-text-faint]">
              Merch Maverick
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-2" aria-label="Primary">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                  active
                    ? "bg-[--color-accent-glow] text-[--color-accent]"
                    : "text-[--color-text-dim] hover:bg-[--color-surface-2] hover:text-[--color-text]"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
        <p className="mono px-5 py-4 text-[10px] text-[--color-text-faint]">
          v1.0 · local-first · BYOK
        </p>
      </aside>
      <main className="ml-56 min-h-dvh flex-1 p-8">{children}</main>
    </div>
  );
}
