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

    const { withdrawalId, action, adminId } = await req.json();

    if (!withdrawalId || !action || !adminId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["approve", "reject", "complete"].includes(action)) {
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

    // Fetch withdrawal
    const { data: withdrawal, error: witErr } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawalId)
      .single();

    if (witErr || !withdrawal) {
      return new Response(
        JSON.stringify({ error: "Withdrawal not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let newStatus: string;
    let updateData: any = { reviewed_by: adminId, reviewed_at: new Date().toISOString() };

    if (action === "approve") {
      if (withdrawal.status !== "pending") {
        return new Response(
          JSON.stringify({ error: "Withdrawal already processed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      newStatus = "approved";

      // Deduct from user balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance, total_withdrawals, pending_withdrawals, full_name")
        .eq("id", withdrawal.user_id)
        .single();

      if (profile) {
        const newBalance = Math.max(0, (profile.balance || 0) - withdrawal.amount);
        const newPending = Math.max(0, (profile.pending_withdrawals || 0) - withdrawal.amount);
        await supabase
          .from("profiles")
          .update({
            balance: newBalance,
            pending_withdrawals: newPending,
            updated_at: new Date().toISOString(),
          })
          .eq("id", withdrawal.user_id);
      }

      // Record transaction
      await supabase.from("transactions").insert({
        user_id: withdrawal.user_id,
        type: "withdrawal",
        amount: withdrawal.amount,
        status: "approved",
        notes: `Withdrawal to ${withdrawal.wallet_address} (${withdrawal.crypto_type}) approved by admin`,
      });
    } else if (action === "complete") {
      if (withdrawal.status !== "approved") {
        return new Response(
          JSON.stringify({ error: "Withdrawal must be approved first" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      newStatus = "completed";
      updateData.completed_at = new Date().toISOString();

      // Update total_withdrawals
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_withdrawals")
        .eq("id", withdrawal.user_id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({
            total_withdrawals: (profile.total_withdrawals || 0) + withdrawal.amount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", withdrawal.user_id);
      }
    } else {
      // reject
      if (withdrawal.status !== "pending") {
        return new Response(
          JSON.stringify({ error: "Withdrawal already processed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      newStatus = "rejected";

      // Restore pending_withdrawals
      const { data: profile } = await supabase
        .from("profiles")
        .select("pending_withdrawals")
        .eq("id", withdrawal.user_id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({
            pending_withdrawals: Math.max(0, (profile.pending_withdrawals || 0) - withdrawal.amount),
          })
          .eq("id", withdrawal.user_id);
      }
    }

    updateData.status = newStatus;
    await supabase.from("withdrawals").update(updateData).eq("id", withdrawalId);

    // Notify user
    const notifTitle = action === "approve" ? "Withdrawal Approved" : action === "complete" ? "Withdrawal Completed" : "Withdrawal Rejected";
    const notifMsg = action === "approve"
      ? `Your withdrawal of $${withdrawal.amount.toLocaleString()} (${withdrawal.crypto_type}) has been approved and is being processed.`
      : action === "complete"
      ? `Your withdrawal of $${withdrawal.amount.toLocaleString()} (${withdrawal.crypto_type}) has been completed and sent to your wallet.`
      : `Your withdrawal of $${withdrawal.amount.toLocaleString()} (${withdrawal.crypto_type}) has been rejected. Please contact support.`;

    await supabase.from("notifications").insert({
      user_id: withdrawal.user_id,
      type: "withdrawal",
      title: notifTitle,
      message: notifMsg,
    });

    // Admin notification
    await supabase.from("admin_notifications").insert({
      user_id: withdrawal.user_id,
      type: "withdrawal",
      title: `Withdrawal ${newStatus}`,
      message: `Withdrawal of $${withdrawal.amount.toLocaleString()} has been ${newStatus} by admin.`,
      metadata: { withdrawalId, amount: withdrawal.amount, action },
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
