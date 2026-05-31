"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/panel/Topbar";
import { createClient } from "@/lib/supabase/client";

type Client = {
  id: string;
  name: string;
  contact: string | null;
  unit_code: string;
  plan: string | null;
  status: "activo" | "onboarding" | "pausado";
  progress: number;
  since: string;
  created_at: string;
};

const STATUS_STYLES: Record<
  Client["status"],
  { bg: string; color: string; label: string }
> = {
  activo: { bg: "#E1F0E8", color: "#1F8A5B", label: "Activo" },
  onboarding: { bg: "#FCE9D8", color: "#B5630C", label: "Onboarding" },
  pausado: { bg: "var(--color-mist)", color: "var(--color-slate2)", label: "Pausado" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setClients(data as Client[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = searchTerm
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
          c.unit_code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : clients;

  // Stats
  const activeCount = clients.filter((c) => c.status === "activo").length;
  const onboardingCount = clients.filter((c) => c.status === "onboarding").length;
  const unitsWithClients = new Set(clients.map((c) => c.unit_code)).size;
  const avgProgress =
    clients.length > 0
      ? Math.round(clients.reduce((acc, c) => acc + (c.progress ?? 0), 0) / clients.length)
      : 0;

  return (
    <>
      <Topbar
        breadcrumb="Nodo Core · Gestión"
        title="Clientes"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar clientes..."
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 30px" }}>
        {/* Stats */}
        <div
          className="panel-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
            marginBottom: 24,
          }}
        >
          {[
            { label: "Clientes activos", value: activeCount },
            { label: "En onboarding", value: onboardingCount },
            { label: "Unidades con clientes", value: unitsWithClients },
            { label: "Avance promedio", value: `${avgProgress}%` },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "white",
                border: "1px solid var(--color-mist)",
                borderRadius: 10,
                padding: "18px 20px",
              }}
            >
              <p style={{ margin: 0, fontSize: 13, color: "var(--color-slate2)", fontWeight: 500, marginBottom: 6 }}>
                {stat.label}
              </p>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--color-navy)" }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div
          style={{
            background: "white",
            border: "1px solid var(--color-mist)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--color-slate2)", fontSize: 14 }}>
              Cargando clientes...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--color-slate2)", fontSize: 14 }}>
              No se encontraron clientes.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--color-mist-200)" }}>
                  {["Cliente", "Unidad", "Plan", "Estado", "Avance plataforma", "Cliente desde"].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: "11px 16px",
                        textAlign: "left",
                        fontSize: 11.5,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--color-slate2)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((client, idx) => {
                  const status = STATUS_STYLES[client.status] ?? STATUS_STYLES.pausado;
                  const initials = getInitials(client.name);
                  return (
                    <tr
                      key={client.id}
                      style={{
                        borderTop: idx === 0 ? "none" : "1px solid var(--color-mist)",
                        transition: "background 100ms",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-paper)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      {/* Cliente */}
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 34, height: 34, borderRadius: "50%",
                              background: "var(--color-navy)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--color-ink)" }}>
                              {client.name}
                            </p>
                            {client.contact && (
                              <p style={{ margin: 0, fontSize: 12, color: "var(--color-slate2)" }}>
                                {client.contact}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Unidad */}
                      <td style={{ padding: "13px 16px" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: 11.5,
                            background: "var(--color-mist-200)",
                            borderRadius: 6,
                            padding: "3px 8px",
                            color: "var(--color-navy)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          nodo | <span style={{ fontWeight: 600 }}>{client.unit_code}</span>
                        </span>
                      </td>

                      {/* Plan */}
                      <td style={{ padding: "13px 16px", fontSize: 13.5, color: "var(--color-ink)" }}>
                        {client.plan ?? "—"}
                      </td>

                      {/* Estado */}
                      <td style={{ padding: "13px 16px" }}>
                        <span
                          style={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            background: status.bg,
                            color: status.color,
                            borderRadius: 999,
                            padding: "3px 10px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {status.label}
                        </span>
                      </td>

                      {/* Avance */}
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              width: 110, height: 7, borderRadius: 999,
                              background: "var(--color-mist)", overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${client.progress ?? 0}%`,
                                height: "100%",
                                background: "var(--color-brand)",
                                borderRadius: 999,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-slate2)" }}>
                            {client.progress ?? 0}%
                          </span>
                        </div>
                      </td>

                      {/* Desde */}
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--color-slate2)" }}>
                        {formatDate(client.since)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
