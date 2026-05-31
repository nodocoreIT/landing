import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { getNodeBySlug } from "@/lib/nodes";

// Temporary landing for each business unit while the real /nodo-* pages are
// built. Reads its content from the shared NODES catalog so a single edit keeps
// the diagram and these pages in sync.
export default function NodoPlaceholder({ slug }: { slug: string }) {
  const node = getNodeBySlug(slug);
  if (!node) notFound();

  const { Icon, label, description } = node;

  return (
    <div style={{ backgroundColor: "var(--color-navy-900)" }}>
      <Navbar />
      <main>
        <section
          className="relative overflow-hidden pt-[160px] pb-[clamp(80px,12vw,160px)]"
          style={{ backgroundColor: "var(--color-navy-900)" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 55% at 50% 38%, rgba(218,90,14,.18), transparent 70%)",
            }}
          />

          <div className="w-[min(1200px,92vw)] mx-auto relative z-10 flex flex-col items-center text-center">
            <span className="mb-7 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-brand/15 text-brand">
              <Icon className="h-9 w-9" strokeWidth={1.75} aria-hidden="true" />
            </span>

            <p className="text-[13px] font-bold uppercase tracking-[.16em] text-brand mb-4">
              Unidad del ecosistema
            </p>

            <h1
              className="font-display font-extrabold text-white max-w-[14em]"
              style={{ fontSize: "clamp(36px,5vw,64px)", lineHeight: 1.06 }}
            >
              {label}
            </h1>

            <p
              className="max-w-[560px] mx-auto mt-6 leading-relaxed"
              style={{
                fontSize: "clamp(17px,1.5vw,21px)",
                color: "rgba(234,240,247,.72)",
              }}
            >
              {description}
            </p>

            <p className="mt-4 text-[14px] text-white/45">
              Esta sección está en construcción.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/#contacto"
                className="inline-flex items-center justify-center px-7 py-3.5 text-[16px] font-semibold rounded-md bg-brand text-white hover:bg-brand-600 active:scale-[.98] transition-all duration-150"
              >
                Solicitar una demo
              </Link>
              <Link
                href="/"
                className="btn-ghost-light inline-flex items-center justify-center px-7 py-3.5 text-[16px] font-semibold rounded-md text-white"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
