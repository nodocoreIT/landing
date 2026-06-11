import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=Token+faltante", request.url));
  }

  const admin = createAdminClient();

  try {
    // 1. Find the pending registration request
    const { data: pending, error: selectErr } = await admin
      .from("pending_registrations")
      .select("*")
      .eq("verification_token", token)
      .maybeSingle();

    if (selectErr || !pending) {
      console.error("Error finding pending registration:", selectErr);
      return NextResponse.redirect(
        new URL("/login?error=Token+de+verificacion+invalido+o+expirado", request.url)
      );
    }

    // 2. Double check if client already exists
    const { data: existingClient } = await admin
      .from("clients")
      .select("id")
      .eq("email", pending.email)
      .maybeSingle();

    let clientId = existingClient?.id;

    if (!clientId) {
      // 3. Create the client record
      const { data: newClient, error: clientErr } = await admin
        .from("clients")
        .insert({
          name: pending.full_name,
          email: pending.email,
        })
        .select("id")
        .single();

      if (clientErr || !newClient) {
        console.error("Error creating client from pending:", clientErr);
        return NextResponse.redirect(
          new URL("/login?error=Error+al+crear+la+cuenta", request.url)
        );
      }
      clientId = newClient.id;
    }

    // 3.5 Create user in Supabase Auth so they can log in and reset passwords
    try {
      const { error: authErr } = await admin.auth.admin.createUser({
        email: pending.email,
        password: pending.password,
        email_confirm: true,
        user_metadata: {
          full_name: pending.full_name,
        },
      });

      if (authErr && !authErr.message.includes("already") && !authErr.message.includes("registered")) {
        console.error("Auth user creation error:", authErr);
      }
    } catch (authEx) {
      console.error("Auth user creation exception:", authEx);
    }

    // 4. Create the client unit for NODO Salud or NODO Inmo
    const isPatient = pending.plan === "paciente";
    const isInmo = pending.plan === "inmo";
    const { error: unitErr } = await admin
      .from("client_units")
      .insert({
        client_id: clientId,
        unit_code: isInmo ? "inmo" : "salud",
        plan: pending.plan,
        status: (isPatient || isInmo) ? "activo" : "onboarding",
        progress: (isPatient || isInmo) ? 100 : 0,
        access_url: isInmo ? "https://nodoinmo.vercel.app/" : "https://nodo-clinica.fly.dev/",
        access_user: pending.email,
        access_password: pending.password,
      });

    if (unitErr) {
      console.error("Error creating client unit from pending:", unitErr);
      return NextResponse.redirect(
        new URL("/login?error=Error+al+vincular+el+nodo", request.url)
      );
    }

    // 5. Delete the pending registration request
    await admin.from("pending_registrations").delete().eq("id", pending.id);

    // 6. Redirect to verified success screen
    return NextResponse.redirect(
      new URL(`/nodo-salud/clinica-virtual/verificado?node=${isInmo ? "inmo" : "salud"}${isPatient ? "&role=paciente" : ""}`, request.url)
    );
  } catch (err) {
    console.error("Registration verification exception:", err);
    return NextResponse.redirect(
      new URL("/login?error=Error+interno+al+verificar+cuenta", request.url)
    );
  }
}
