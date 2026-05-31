"use client";

const DEFAULT_UNITS = [
  { code: "Inmo" },
  { code: "Obra" },
  { code: "Capital" },
  { code: "IT" },
  { code: "Legal" },
  { code: "Seguros" },
  { code: "Agro" },
  { code: "Propiedad" },
];

interface EcosystemDiagramProps {
  dark?: boolean;
  units?: { code: string }[];
  className?: string;
}

export default function EcosystemDiagram({
  dark = false,
  units = DEFAULT_UNITS,
  className = "",
}: EcosystemDiagramProps) {
  const W = 520;
  const H = 520;
  const cx = W / 2;
  const cy = H / 2;
  const R = 190;
  const coreR = 46;
  const satR = 31;
  const haloR = coreR + 14;
  const n = units.length;

  const stroke = dark ? "rgba(222,231,241,.34)" : "rgba(100,120,144,.55)";
  const satFill = dark ? "#233650" : "#FFFFFF";
  const satStroke = dark ? "rgba(222,231,241,.55)" : "#C6D3E2";
  const satText = dark ? "#DEE7F1" : "#1B2A41";
  const shadowOpacity = dark ? 0.45 : 0.14;

  const points = Array.from({ length: n }, (_, i) => {
    const angle = ((-90 + (i * 360) / n) * Math.PI) / 180;
    return {
      x: cx + R * Math.cos(angle),
      y: cy + R * Math.sin(angle),
    };
  });

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ overflow: "visible" }}>
        <defs>
          <filter id="nodoShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="6"
              floodColor="#1B2A41"
              floodOpacity={shadowOpacity}
            />
          </filter>
        </defs>

        {/* Orbit ring */}
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={stroke}
          strokeDasharray="2 7"
          strokeWidth="1.5"
        />

        {/* Lines from center to satellites */}
        {points.map((p, i) => (
          <line
            key={`line-${i}`}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke={stroke}
            strokeWidth="1.5"
          />
        ))}

        {/* Satellites */}
        {points.map((p, i) => (
          <g key={`sat-${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={satR}
              fill={satFill}
              stroke={satStroke}
              strokeWidth="1.5"
              filter="url(#nodoShadow)"
            />
            <text
              x={p.x}
              y={p.y + 4}
              textAnchor="middle"
              fill={satText}
              fontFamily="var(--font-sans)"
              fontSize="12.5"
              fontWeight="600"
            >
              {units[i].code}
            </text>
          </g>
        ))}

        {/* Core halo */}
        <circle cx={cx} cy={cy} r={haloR} fill="rgba(218,90,14,.12)" />

        {/* Core circle */}
        <circle cx={cx} cy={cy} r={coreR} fill="#DA5A0E" />

        {/* Core text */}
        <text
          x={cx}
          y={cy + 6}
          textAnchor="middle"
          fill="#fff"
          fontFamily="var(--font-display)"
          fontSize="19"
          fontWeight="700"
        >
          Core
        </text>
      </svg>
    </div>
  );
}
