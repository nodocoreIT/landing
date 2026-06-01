"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import EcosystemDiagram from "@/components/EcosystemDiagram";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    let valid = true;
    if (!validEmail(email.trim())) {
      setEmailError("Ingrese un correo válido.");
      valid = false;
    }
    if (password.trim().length < 4) {
      setPasswordError("Ingrese su contraseña.");
      valid = false;
    }
    if (!valid) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      setGeneralError(
        "Credenciales incorrectas. Verifique e intente nuevamente.",
      );
      setLoading(false);
      return;
    }

    router.push("/panel");
  }

  const inputBase =
    "w-full text-[15px] py-[13px] px-[15px] rounded-md bg-white border transition-all duration-150 outline-none";
  const inputNormal = "border-mist text-ink";
  const inputError = "border-[#C0392B] shadow-[0_0_0_4px_rgba(192,57,43,.12)]";
  const inputFocus =
    "focus:border-brand focus:shadow-[0_0_0_4px_rgba(218,90,14,.16)]";

  return (
    <>
      {/* Back button — top-right of the (light) form panel, brand-colored. */}
      <Link
        href="/"
        className="fixed top-[22px] right-[22px] z-10 inline-flex items-center gap-2 px-4 py-2 text-[14px] font-semibold rounded-md bg-brand text-white shadow-sm hover:bg-brand-600 active:scale-[.98] transition-all duration-150"
      >
        ← Volver a la web
      </Link>

      <div className="min-h-screen grid grid-cols-1 login-split">
        {/* Brand panel (left) */}
        <aside className="login-brand-panel relative overflow-hidden bg-navy-900 text-white p-12 flex-col justify-between hidden">
          {/* Glow */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(70% 50% at 30% 30%, rgba(218,90,14,.20), transparent 70%)",
            }}
          />

          <div className="relative z-[1]">
            <Image
              src="/nodo-logo-white.png"
              alt="Nodo Core"
              height={30}
              width={140}
              className="h-[30px] w-auto"
            />
          </div>

          <div className="relative z-[1]">
            <EcosystemDiagram
              dark
              className="w-[min(440px,70%)] aspect-square mx-auto my-3"
            />
            <h2
              className="font-display font-bold text-white max-w-[14em]"
              style={{ fontSize: "clamp(26px,2.6vw,38px)" }}
            >
              El <span className="text-brand">núcleo</span> de gestión de su
              ecosistema.
            </h2>
            <p
              className="text-[15.5px] mt-3 max-w-[30em]"
              style={{ color: "rgba(234,240,247,.7)" }}
            >
              Panel de administración para gestionar clientes, unidades de
              negocio y el roadmap del Core.
            </p>
          </div>

          <div
            className="relative z-[1] text-[13px]"
            style={{ color: "rgba(234,240,247,.5)" }}
          >
            © 2026 Nodo Core · Transparencia tecnológica
          </div>
        </aside>

        {/* Form panel (right) */}
        <main className="flex items-center justify-center p-10 bg-paper min-h-screen">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="w-[min(420px,100%)]"
          >
            {/* Kicker */}
            <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.14em] text-brand">
              ◎ Acceso administradores
            </span>

            <h1 className="font-display font-bold text-ink text-[30px] mt-3 mb-1">
              Iniciar sesión
            </h1>
            <p className="text-slate2 text-[15px] mb-7">
              Ingrese sus credenciales para acceder al panel de Nodo Core.
            </p>

            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="login-email"
                className="block text-[13px] font-semibold text-navy mb-2"
              >
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="admin@nodocore.com"
                autoComplete="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                className={`${inputBase} ${emailError ? inputError : inputNormal} ${inputFocus}`}
              />
              {emailError && (
                <p className="text-[12.5px] text-[#C0392B] mt-1.5">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label
                htmlFor="login-pass"
                className="block text-[13px] font-semibold text-navy mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-pass"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  className={`${inputBase} ${passwordError ? inputError : inputNormal} ${inputFocus} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate2 hover:text-ink cursor-pointer select-none bg-transparent border-none p-1"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-[12.5px] text-[#C0392B] mt-1.5">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Remember + forgot */}
            <div className="flex items-center justify-between mb-5">
              <label className="flex items-center gap-2 text-[13.5px] text-slate2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="accent-brand"
                />
                Mantener sesión iniciada
              </label>
              <span className="text-[13.5px] text-brand font-semibold cursor-pointer">
                ¿Olvidó su contraseña?
              </span>
            </div>

            {/* General error */}
            {generalError && (
              <p className="text-[13px] text-[#C0392B] mb-3 text-center">
                {generalError}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-md bg-brand text-white font-semibold text-[16px] hover:bg-brand-600 active:scale-[.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Ingresando…" : "Ingresar al panel"}
            </button>
            {/* TODO BORRAR ESTE DIV
            <div className="mt-4 p-3 rounded-md bg-mist-200 border border-mist text-[12.5px] text-slate2">
              Demostración: use <strong className="text-navy">admin@nodocore.com</strong>{" "}
              y cualquier contraseña de 4+ caracteres.
            </div> */}
          </form>
        </main>
      </div>
    </>
  );
}
