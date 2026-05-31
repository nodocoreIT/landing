"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Filosofía", href: "#filosofia" },
  { label: "Unidades", href: "#unidades" },
  { label: "Beneficios", href: "#beneficios" },
  { label: "Contacto", href: "#contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled
          ? "rgba(18,30,47,.85)"
          : "rgba(18,30,47,.6)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,.08)"
          : "1px solid transparent",
      }}
    >
      <div className="w-[min(1200px,92vw)] mx-auto flex items-center justify-between h-[68px]">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/nodo-logo-white.png"
            alt="Nodo Core"
            height={32}
            width={137}
            className="h-[32px] w-auto"
            priority
          />
        </Link>

        {/* Center links */}
        <ul className="nav-links flex items-center gap-8 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-[14.5px] font-medium text-white/70 hover:text-white transition-colors duration-150"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="nav-access-btn inline-block text-[14px] font-semibold text-white/80 hover:text-white transition-colors duration-150 px-4 py-2 rounded-md border border-white/20 hover:border-white/40"
          >
            Acceso clientes
          </Link>
          <a
            href="#contacto"
            className="inline-flex items-center justify-center px-5 py-2.5 text-[14px] font-semibold rounded-md bg-brand text-white hover:bg-brand-600 transition-colors duration-150"
          >
            Solicitar demo
          </a>
        </div>
      </div>
    </nav>
  );
}
