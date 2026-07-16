import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { userId, email, fullName, browser, device, os, ipAddress, country, city, status } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record login activity in login_activity table
    await supabase.from("login_activity").insert({
      user_id: userId,
      ip_address: ipAddress || null,
      device: device || null,
      browser: browser || null,
      country: country || null,
      city: city || null,
      status: status || "success",
    });

    // Create admin notification about the login
    const loginTime = new Date().toISOString();
    const metadata = {
      email,
      fullName,
      browser,
      device,
      os,
      ipAddress,
      country,
      city,
      loginTime,
      status: status || "success",
    };

    await supabase.from("admin_notifications").insert({
      user_id: userId,
      type: "login",
      title: "User Login",
      message: `${fullName || email || "A user"} logged in from ${device || "unknown device"} using ${browser || "unknown browser"}${country ? ` in ${country}` : ""}.`,
      metadata,
    });

    // Check if email login notifications are enabled
    const { data: setting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "email_login_notifications")
      .maybeSingle();

    // If email notifications are enabled, we could send an email here
    // (Supabase has built-in email, but for now we just log it)
    const emailEnabled = setting?.value !== "false";

    // Also create a user notification about the login
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "login",
      title: "New Login Detected",
      message: `A login to your account was detected on ${new Date().toLocaleString()} from ${device || "unknown device"} using ${browser || "unknown browser"}${country ? ` in ${country}` : ""}. If this was not you, please change your password immediately.`,
    });

    return new Response(
      JSON.stringify({ success: true, emailEnabled }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
