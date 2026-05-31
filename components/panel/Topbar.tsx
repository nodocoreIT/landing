"use client";

type TopbarProps = {
  breadcrumb: string;
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
};

export default function Topbar({
  breadcrumb,
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
}: TopbarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 30px",
        borderBottom: "1px solid var(--color-mist)",
        background: "rgba(245,248,252,.9)",
        backdropFilter: "blur(8px)",
        flexShrink: 0,
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--color-slate2)",
            marginBottom: 2,
          }}
        >
          {breadcrumb}
        </p>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: "var(--color-ink)",
            fontFamily: "var(--font-display)",
          }}
        >
          {title}
        </h1>
      </div>
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          background: "white",
          border: "1px solid var(--color-mist)",
          borderRadius: 999,
          padding: "9px 16px",
          minWidth: 240,
          fontSize: 13.5,
          color: "var(--color-ink)",
          outline: "none",
          fontFamily: "var(--font-sans)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--color-brand)";
          e.currentTarget.style.boxShadow =
            "0 0 0 3px rgba(218,90,14,.12)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--color-mist)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}
