"use client";

import { Globe, MessageCircle, Camera, ExternalLink } from "lucide-react";
import { SITE_CONFIG, FOOTER_LINKS } from "@/lib/constants";

const socialIcons = [
  { name: "Facebook", icon: Globe, href: "#" },
  { name: "Twitter", icon: MessageCircle, href: "#" },
  { name: "Instagram", icon: Camera, href: "#" },
  { name: "LinkedIn", icon: ExternalLink, href: "#" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold">
                V
              </div>
              <span className="text-lg font-bold text-foreground">
                {SITE_CONFIG.name}
              </span>
            </a>
            <p className="text-xs text-foreground-muted mb-5 leading-relaxed">
              Your trusted partner for global visa applications.
            </p>
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
          </div>

          {/* Company Links */}
          <div className="md:col-start-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Company</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-xs text-foreground-muted hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.06] py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-foreground-muted">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex gap-5">
            <a href="#" className="text-[11px] text-foreground-muted hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-[11px] text-foreground-muted hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="text-[11px] text-foreground-muted hover:text-foreground transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
