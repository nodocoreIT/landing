import Image from "next/image";
import Link from "next/link";

const ecosystemLinks = ["Inmo", "Obra", "Capital", "IT"];
const companyLinks = [
  { label: "Filosofía", href: "#filosofia" },
  { label: "Beneficios", href: "#beneficios" },
  { label: "Contacto", href: "#contacto" },
];
const accessLinks = [
  { label: "Ingreso clientes", href: "/login" },
  { label: "Panel administración", href: "/login" },
];

const colHeaderClass =
  "block text-[13px] font-bold uppercase tracking-[.1em] mb-5 text-slate2-300";

const linkClass =
  "block text-[14.5px] mb-3 transition-colors duration-150 hover:text-white";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--color-footer)" }}>
      <div className="w-[min(1200px,92vw)] mx-auto pt-16 pb-8">
        {/* Main grid */}
        <div
          className="footer-grid grid gap-10"
          style={{
            gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
          }}
        >
          {/* Col 1: Brand */}
          <div>
            <Image
              src="/nodo-logo-white.png"
              alt="Nodo Core"
              height={26}
              width={120}
              className="h-[26px] w-auto mb-5"
            />
            <p
              className="text-[14.5px] leading-relaxed max-w-[260px]"
              style={{ color: "rgba(255,255,255,.66)" }}
            >
              El ecosistema que centraliza, conecta y potencia. Un holding
              tecnológico-productivo construido sobre la transparencia.
            </p>
          </div>

          {/* Col 2: Ecosistema */}
          <div>
            <span className={colHeaderClass}>Ecosistema</span>
            <ul className="list-none m-0 p-0">
              {ecosystemLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#unidades"
                    className={linkClass}
                    style={{ color: "rgba(255,255,255,.74)" }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Empresa */}
          <div>
            <span className={colHeaderClass}>Empresa</span>
            <ul className="list-none m-0 p-0">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={linkClass}
                    style={{ color: "rgba(255,255,255,.74)" }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Acceso */}
          <div>
            <span className={colHeaderClass}>Acceso</span>
            <ul className="list-none m-0 p-0">
              {accessLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={linkClass}
                    style={{ color: "rgba(255,255,255,.74)" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 mt-12 pt-6 text-[13px]"
          style={{
            borderTop: "1px solid rgba(255,255,255,.1)",
            color: "rgba(255,255,255,.4)",
          }}
        >
          <span>© 2026 Nodo Core. Todos los derechos reservados.</span>
          <span>Transparencia tecnológica</span>
        </div>
      </div>

    </footer>
  );
}
