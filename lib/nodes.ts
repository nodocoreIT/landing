import {
  Building2,
  HardHat,
  Coins,
  Cpu,
  Scale,
  ShieldCheck,
  Wheat,
  Calculator,
  type LucideIcon,
} from "lucide-react";

// Single source of truth for every business unit ("nodo"): its routing slug,
// display label, short blurb and icon. Consumed by the ecosystem diagram and
// by each /nodo-* route.
export interface NodeDef {
  code: string;
  slug: string;
  label: string;
  description: string;
  Icon: LucideIcon;
}

export const NODES: NodeDef[] = [
  {
    code: "Inmo",
    slug: "inmo",
    label: "Nodo Inmo",
    description:
      "Gestión inmobiliaria de nueva generación, con respaldo de martilleros públicos.",
    Icon: Building2,
  },
  {
    code: "Obra",
    slug: "obra",
    label: "Nodo Obra",
    description:
      "Administración de proyectos constructivos: avances, gastos, registros y pagos.",
    Icon: HardHat,
  },
  {
    code: "Capital",
    slug: "capital",
    label: "Nodo Capital",
    description:
      "División financiera enfocada en la formación de grupos inversores.",
    Icon: Coins,
  },
  {
    code: "IT",
    slug: "it",
    label: "Nodo IT",
    description:
      "El motor tecnológico: software a medida e infraestructura corporativa.",
    Icon: Cpu,
  },
  {
    code: "Legal",
    slug: "legal",
    label: "Nodo Legal",
    description:
      "Asesoramiento jurídico integral, transversal a todas las áreas.",
    Icon: Scale,
  },
  // {
  //   code: "Seguros",
  //   slug: "seguros",
  //   label: "Nodo Seguros",
  //   description:
  //     "Protección estratégica para blindar los activos del ecosistema.",
  //   Icon: ShieldCheck,
  // },
  {
    code: "Agro",
    slug: "agro",
    label: "Nodo Agro",
    description:
      "Soluciones integrales para el sector productivo y los negocios rurales.",
    Icon: Wheat,
  },
  {
    code: "Contable",
    slug: "contable",
    label: "Nodo Contable",
    description:
      "Gestión contable e impositiva: balances, liquidaciones de impuestos y cumplimiento fiscal.",
    Icon: Calculator,
  },
];

export function getNodeBySlug(slug: string): NodeDef | undefined {
  return NODES.find((n) => n.slug === slug);
}
