"use client";

import { useEffect, useState } from "react";

import { DEFAULT_WHATSAPP_MESSAGE, whatsappLink } from "@/lib/site";

/**
 * Floating WhatsApp entry point. Appears once the visitor has scrolled past the
 * hero, expands to a labelled pill on hover/focus, and is keyboard reachable.
 */
export default function WhatsAppFab({ number }: { number: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const digits = (number || "").replace(/[^\d]/g, "");

  return (
    <a
      href={whatsappLink(number, DEFAULT_WHATSAPP_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with SHUNYA on WhatsApp"
      className={`group fixed bottom-5 right-5 z-[85] flex items-center gap-3 rounded-full border border-bone/15 bg-charcoal/90 py-2.5 pl-2.5 pr-3.5 shadow-[0_18px_50px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-500 md:bottom-8 md:right-8 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <span className="relative grid h-9 w-9 place-items-center rounded-full bg-[#25D366] text-black">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.93 1.35-.53.05-1.02.24-3.45-.72-2.92-1.15-4.76-4.19-4.9-4.38-.15-.2-1.16-1.55-1.16-2.95 0-1.4.73-2.09 1-2.38.24-.27.53-.34.73-.34h.53c.17 0 .39-.03.6.46.24.53.8 1.98.87 2.13.07.15.12.32.02.51-.1.2-.22.32-.42.53-.2.2-.31.32-.44.53-.15.24-.05.44.07.63.12.2.68 1.12 1.46 1.81 1 .89 1.83 1.16 2.09 1.29.26.12.42.1.58-.07.17-.19.71-.83.9-1.11.2-.29.39-.24.63-.15.24.1 1.53.72 1.79.85.26.12.44.19.51.3.07.1.07.62-.17 1.3Z" />
        </svg>
        <span className="absolute inset-0 animate-pulse-ring rounded-full border border-[#25D366]" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-ash">
          Direct line
        </span>
        <span className="text-[0.8rem] font-medium text-bone">
          {digits ? "Chat on WhatsApp" : "Add WhatsApp number"}
        </span>
      </span>
    </a>
  );
}
