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

    const { depositId, action, adminId, planId } = await req.json();

    if (!depositId || !action || !adminId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify admin
    const { data: adminProfile, error: adminErr } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", adminId)
      .single();

    if (adminErr || !adminProfile || adminProfile.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch deposit
    const { data: deposit, error: depErr } = await supabase
      .from("deposits")
      .select("*")
      .eq("id", depositId)
      .single();

    if (depErr || !deposit) {
      return new Response(
        JSON.stringify({ error: "Deposit not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (deposit.status !== "pending") {
      return new Response(
        JSON.stringify({ error: "Deposit already processed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    // Update deposit status
    await supabase
      .from("deposits")
      .update({
        status: newStatus,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", depositId);

    if (action === "approve") {
      // Credit user balance and total_deposits
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance, total_deposits, full_name")
        .eq("id", deposit.user_id)
        .single();

      if (profile) {
        const newBalance = (profile.balance || 0) + deposit.amount;
        const newTotalDeposits = (profile.total_deposits || 0) + deposit.amount;
        await supabase
          .from("profiles")
          .update({
            balance: newBalance,
            total_deposits: newTotalDeposits,
            updated_at: new Date().toISOString(),
          })
          .eq("id", deposit.user_id);
      }

      // Record transaction
      await supabase.from("transactions").insert({
        user_id: deposit.user_id,
        type: "deposit",
        amount: deposit.amount,
        status: "approved",
        notes: `Deposit via ${deposit.crypto_type} approved by admin`,
      });

      // Auto-start investment if a plan was selected
      if (planId) {
        const { data: plan } = await supabase
          .from("investment_plans")
          .select("*")
          .eq("id", planId)
          .single();

        if (plan) {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + plan.duration_days);
          const expectedReturn = (deposit.amount * plan.roi_percent) / 100 + deposit.amount;
          const dailyProfit = (deposit.amount * plan.roi_percent) / 100 / plan.duration_days;

          await supabase.from("user_investments").insert({
            user_id: deposit.user_id,
            plan_id: planId,
            amount: deposit.amount,
            roi_percent: plan.roi_percent,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            status: "active",
            expected_return: expectedReturn,
            actual_return: 0,
            daily_profit: dailyProfit,
            source: "deposit",
          });

          // Record investment transaction
          await supabase.from("transactions").insert({
            user_id: deposit.user_id,
            type: "investment",
            amount: deposit.amount,
            status: "approved",
            notes: `Investment in ${plan.name} (${plan.roi_percent}% ROI for ${plan.duration_days} days)`,
          });

          // Notify user about investment
          await supabase.from("notifications").insert({
            user_id: deposit.user_id,
            type: "investment",
            title: "Investment Started",
            message: `Your investment of $${deposit.amount.toLocaleString()} in ${plan.name} is now active. Expected return: $${expectedReturn.toLocaleString()} over ${plan.duration_days} days.`,
          });

          // Admin notification
          await supabase.from("admin_notifications").insert({
            user_id: deposit.user_id,
            type: "investment",
            title: "Investment Auto-Started",
            message: `Investment of $${deposit.amount.toLocaleString()} auto-started for ${profile?.full_name || "user"} in plan ${plan.name}.`,
            metadata: { depositId, planId, amount: deposit.amount },
          });
        }
      }

      // Notify user about deposit approval
      await supabase.from("notifications").insert({
        user_id: deposit.user_id,
        type: "deposit",
        title: "Deposit Approved",
        message: `Your deposit of $${deposit.amount.toLocaleString()} (${deposit.crypto_type}) has been approved and credited to your account.`,
      });
    } else {
      // Rejection
      await supabase.from("notifications").insert({
        user_id: deposit.user_id,
        type: "deposit",
        title: "Deposit Rejected",
        message: `Your deposit of $${deposit.amount.toLocaleString()} (${deposit.crypto_type}) has been rejected. Please contact support if you believe this is an error.`,
      });
    }

    // Admin notification for the action
    await supabase.from("admin_notifications").insert({
      user_id: deposit.user_id,
      type: "deposit",
      title: `Deposit ${newStatus}`,
      message: `Deposit of $${deposit.amount.toLocaleString()} has been ${newStatus} by admin.`,
      metadata: { depositId, amount: deposit.amount, action },
    });

    return new Response(
      JSON.stringify({ success: true, status: newStatus }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
