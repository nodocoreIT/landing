import "server-only";
import nodemailer from "nodemailer";

// Zoho SMTP transport. Credentials live in env vars so they never ship to the
// client. Host/port default to Zoho's standard SSL endpoint.
const HOST = process.env.ZOHO_SMTP_HOST ?? "smtp.zoho.com";
const PORT = Number(process.env.ZOHO_SMTP_PORT ?? 465);
const USER = process.env.ZOHO_SMTP_USER;
const PASS = process.env.ZOHO_SMTP_PASSWORD;
const CONTACT_TO = process.env.CONTACT_TO ?? "contacto@nodocore.com.ar";

export function isMailConfigured(): boolean {
  return Boolean(USER && PASS);
}

type ContactPayload = {
  nombre: string;
  email: string;
  mensaje: string;
};

export async function sendContactEmail({
  nombre,
  email,
  mensaje,
}: ContactPayload): Promise<void> {
  if (!isMailConfigured()) {
    throw new Error(
      "SMTP no configurado: faltan ZOHO_SMTP_USER y/o ZOHO_SMTP_PASSWORD."
    );
  }

  const transporter = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: PORT === 465, // 465 = SSL, 587 = STARTTLS
    auth: { user: USER, pass: PASS },
  });

  const escaped = mensaje.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  await transporter.sendMail({
    // Must be the authenticated Zoho mailbox (or one of its aliases).
    from: `"NODO Core · Web" <${USER}>`,
    to: CONTACT_TO,
    replyTo: email, // reply goes straight to the visitor
    subject: `Nuevo contacto web: ${nombre}`,
    text: `Nombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${mensaje}`,
    html: `
      <h2 style="font-family:sans-serif;margin:0 0 12px">Nuevo contacto desde la web</h2>
      <p style="font-family:sans-serif;margin:0 0 6px"><strong>Nombre:</strong> ${nombre}</p>
      <p style="font-family:sans-serif;margin:0 0 6px"><strong>Email:</strong> ${email}</p>
      <p style="font-family:sans-serif;margin:12px 0 4px"><strong>Mensaje:</strong></p>
      <p style="font-family:sans-serif;white-space:pre-wrap;margin:0">${escaped}</p>
    `,
  });
}
