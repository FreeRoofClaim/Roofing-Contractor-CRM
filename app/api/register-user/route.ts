import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

// Send email notification via Resend API (no dependency needed)
async function sendContractorNotification(data: {
  fullName: string;
  email: string;
  phone: string;
  businessAddress?: string;
  serviceRadius?: string;
}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  const htmlBody = `
    <h2>New Contractor Signup</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px;">
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Name</td><td style="padding:8px;border:1px solid #ddd;">${data.fullName}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${data.email}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Phone</td><td style="padding:8px;border:1px solid #ddd;">${data.phone}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Business Address</td><td style="padding:8px;border:1px solid #ddd;">${data.businessAddress || "N/A"}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Service Radius</td><td style="padding:8px;border:1px solid #ddd;">${data.serviceRadius || "N/A"} miles</td></tr>
    </table>
    <p style="margin-top:16px;"><a href="https://freeroofpros.twenty.com">View in Twenty CRM \u2192</a></p>
  `;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "FreeRoofPros <notifications@freeroofpros.com>",
        to: ["info@freeroofpros.com"],
        subject: `\ud83d\udd27 New Contractor Signup: ${data.fullName}`,
        html: htmlBody,
      }),
    });
  } catch (err) {
    console.error("Email notification failed:", err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, fullName, title, phoneNumber, emailAddress, businessAddress, serviceRadius, latitude, longitude, isVerified } = body;

    const { error } = await supabaseServer.from("Roofing_Auth").insert([
      {
        user_id,
        "Full Name": fullName,
        "Title": title,
        "Phone Number": phoneNumber,
        "Email Address": emailAddress,
        "Business Address": businessAddress,
        "Service Radius": serviceRadius,
        "Latitude": latitude,
        "Longitude": longitude,
        "Is Verified": isVerified,
      },
    ]);

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ success: false, message: error.message });
    }

    // Send email notification to info@freeroofpros.com
    await sendContractorNotification({
      fullName,
      email: emailAddress,
      phone: phoneNumber,
      businessAddress,
      serviceRadius,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ success: false, message: err.message });
  }
}
