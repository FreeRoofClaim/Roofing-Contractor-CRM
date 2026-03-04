import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("WEBHOOK:", JSON.stringify(body, null, 2));

    const person = body.record;
    if (!person) return NextResponse.json({ ok: true });

    const email =
      person.emails?.primaryEmail ||
      person.emails?.additionalEmails?.[0];

    if (!email) {
      console.log("No email found");
      return NextResponse.json({ ok: true });
    }

    console.log("Sending invitation to:", email);

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return NextResponse.json({ ok: true });

    const htmlBody = `
      <table style="max-width:600px;width:100%;border-collapse:collapse;margin:0 auto;font-family:Arial,sans-serif;">
        <tr>
          <td style="background:#1e40af;padding:30px;text-align:center;color:#fff;">
            <h1 style="margin:0;font-size:24px;">🏠 Welcome to FreeRoofPros!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:30px;color:#111827;font-size:16px;line-height:1.6;">
            Hi there! 👋<br><br>
            You have been invited to join the <strong>FreeRoofPros Contractor Portal</strong>.<br>
            Sign up now and start working with real leads in your area!
            <div style="text-align:center;margin:30px 0;">
              <a href="https://contractor.freeroofpros.com"
                 style="background-color:#2563eb;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;display:inline-block;">
                Sign Up & Start Now
              </a>
            </div>
            See you inside!
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#9ca3af;">
            © ${new Date().getFullYear()} FreeRoofPros. All rights reserved.
          </td>
        </tr>
      </table>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "FreeRoofPros <notifications@freeroofpros.com>",
        to: [email],
        subject: `🎉 You're Invited to Join FreeRoofPros!`,
        html: htmlBody,
      }),
    });

    console.log("Invitation email sent to:", email);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Webhook crash:", err);
    return NextResponse.json({ error: true });
  }
}