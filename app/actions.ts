"use server";

import { createClient } from "@/lib/supabase/server";
import { sendContactEmail, isMailConfigured } from "@/lib/mail";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const nombre = (formData.get("nombre") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const mensaje = (formData.get("mensaje") as string)?.trim();

  if (!nombre || !email || !mensaje) {
    return { status: "error", message: "Por favor complete todos los campos." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { status: "error", message: "El correo electrónico no es válido." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("contact_leads").insert({
      name: nombre,
      email,
      message: mensaje,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return {
        status: "error",
        message: "Hubo un problema al enviar. Por favor intente nuevamente.",
      };
    }

    // Notify by email (best-effort): the lead is already saved, so a mail
    // hiccup shouldn't fail the user's submission.
    if (isMailConfigured()) {
      try {
        await sendContactEmail({ nombre, email, mensaje });
      } catch (mailErr) {
        console.error("Contact email error:", mailErr);
      }
    } else {
      console.warn(
        "Contact email skipped: SMTP env vars not configured (ZOHO_SMTP_USER / ZOHO_SMTP_PASSWORD)."
      );
    }

    return { status: "success", message: "" };
  } catch (err) {
    console.error("Contact form error:", err);
    return {
      status: "error",
      message: "Hubo un problema al enviar. Por favor intente nuevamente.",
    };
  }
}
