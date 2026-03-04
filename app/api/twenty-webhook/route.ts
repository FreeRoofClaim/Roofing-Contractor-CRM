import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("WEBHOOK:", JSON.stringify(body, null, 2));

    const person = body.record;

    if (!person) {
      return NextResponse.json({ ok: true });
    }

    const email =
      person.emails?.primaryEmail ||
      person.emails?.additionalEmails?.[0];

    if (!email) {
      console.log("No email found");
      return NextResponse.json({ ok: true });
    }

    console.log("Inviting:", email);

    const { error } =
      await getSupabaseAdmin().auth.admin.inviteUserByEmail(email, {
        redirectTo: "https://contractor.freeroofpros.com",
      });

    if (error) {
      console.error("Supabase error:", error);
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Webhook crash:", err);
    return NextResponse.json({ error: true });
  }
}