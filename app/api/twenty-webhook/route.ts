import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const person = body.data;
    const email = person.emails?.[0]?.email;

    if (!email) return NextResponse.json({ ok: true });

    // Create Supabase user (invite)
    const { error } = await getSupabaseAdmin().auth.admin.createUser({
      email,
      email_confirm: false,
    });

    if (error) {
      console.error(error);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false });
  }
}