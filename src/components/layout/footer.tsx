"use client";

import { Globe, MessageCircle, Camera, ExternalLink } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

const socialIcons = [
  { name: "Facebook", icon: Globe, href: "#" },
  { name: "Twitter", icon: MessageCircle, href: "#" },
  { name: "Instagram", icon: Camera, href: "#" },
  { name: "LinkedIn", icon: ExternalLink, href: "#" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06]">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <a href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold">
              V
            </div>
            <span className="text-lg font-bold text-foreground">
              {SITE_CONFIG.name}
            </span>
          </a>
          <div className="flex gap-2">
            {socialIcons.map(({ name, icon: Icon, href }) => (
              <a
                key={name}
                href={href}
                className="h-8 w-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-white/10 transition-all"
                aria-label={name}
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
          <p className="text-[11px] text-foreground-muted">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
