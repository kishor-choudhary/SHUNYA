"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/admin", label: "Dashboard", index: "01" },
  { href: "/admin/events", label: "Events", index: "02" },
  { href: "/admin/gallery", label: "Gallery", index: "03" },
  { href: "/admin/enquiries", label: "Enquiries", index: "04" },
  { href: "/admin/settings", label: "Settings", index: "05" },
];

export default function AdminShell({
  children,
  username,
  unread,
  mustChangePassword,
}: {
  children: React.ReactNode;
  username: string;
  unread: number;
  mustChangePassword: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/admin/session", { method: "DELETE" });
    router.refresh();
    setSigningOut(false);
  }

  return (
    <div className="flex min-h-[100svh] flex-col lg:flex-row">
      {/* --- sidebar ------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-[95] w-[80vw] max-w-xs border-r border-bone/10 bg-ink transition-transform duration-500 lg:static lg:w-[16.5rem] lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
      >
        <div className="flex h-full flex-col justify-between p-6">
          <div>
            <Link href="/admin" className="flex items-baseline gap-3">
              <span>
                <span className="type-display block text-[0.95rem] tracking-[0.28em] text-bone">
                  SHUNYA
                </span>
                <span className="font-mono text-[0.48rem] uppercase tracking-[0.3em] text-ash">
                  Studio
                </span>
              </span>
            </Link>

            <nav aria-label="Studio sections" className="mt-10 space-y-1">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`flex items-center justify-between gap-3 rounded-sm px-3 py-2.5 font-mono text-[0.68rem] uppercase tracking-[0.18em] transition-colors duration-300 ${
                    isActive(link.href)
                      ? "bg-ember/15 text-bone"
                      : "text-fog hover:bg-charcoal hover:text-bone"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-[0.55rem] text-ash/85">{link.index}</span>
                    {link.label}
                  </span>
                  {link.href === "/admin/enquiries" && unread > 0 ? (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1.5 font-mono text-[0.55rem] text-white">
                      {unread}
                    </span>
                  ) : null}
                </Link>
              ))}
            </nav>

            {mustChangePassword ? (
              <Link
                href="/admin/settings#password"
                className="mt-6 block rounded-sm border border-ember/40 bg-ember/10 p-3 font-mono text-[0.55rem] uppercase leading-relaxed tracking-[0.14em] text-ember-glow"
              >
                Default password in use — change it now →
              </Link>
            ) : null}
          </div>

          <div className="space-y-4 border-t border-bone/10 pt-5">
            <div>
              <p className="font-mono text-[0.5rem] uppercase tracking-[0.24em] text-ash">
                Signed in
              </p>
              <p className="mt-1 font-mono text-[0.72rem] text-bone">{username}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className="rounded-sm border border-bone/15 px-3 py-2 text-center font-mono text-[0.6rem] uppercase tracking-[0.18em] text-fog transition-colors hover:border-bone/40 hover:text-bone"
              >
                View live site
              </Link>
              <button
                type="button"
                onClick={signOut}
                disabled={signingOut}
                className="rounded-sm border border-bone/15 px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-fog transition-colors hover:border-ember/60 hover:text-ember-glow"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close studio menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[90] bg-void/70 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      {/* --- content -------------------------------------------------------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-sm focus:bg-ember focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-widest focus:text-white"
        >
          Skip to content
        </a>
        <header className="sticky top-0 z-[85] flex items-center justify-between gap-4 border-b border-bone/10 bg-void/90 px-5 py-3.5 backdrop-blur-xl lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-sm border border-bone/20 lg:hidden"
            aria-label="Open studio menu"
          >
            <span className="flex h-2.5 w-4 flex-col justify-between">
              <span className="h-px w-full bg-bone" />
              <span className="h-px w-full bg-bone" />
              <span className="h-px w-full bg-bone" />
            </span>
          </button>
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-ash">
            {LINKS.find((link) => isActive(link.href))?.label ?? "Studio"}
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-fog sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-ember" />
              Live content
            </span>
            <Link
              href="/admin/events/new"
              className="rounded-sm bg-bone px-3.5 py-2 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-void transition-colors hover:bg-ember hover:text-white"
            >
              New event
            </Link>
          </div>
        </header>

        <main id="main" className="flex-1 px-5 py-8 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
