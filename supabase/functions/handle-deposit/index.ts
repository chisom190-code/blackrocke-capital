import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // --------------------------------------------------
  // 1. CORS PREFLIGHT
  // --------------------------------------------------
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only accept POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    // --------------------------------------------------
    // 2. CREATE ADMIN CLIENT
    // --------------------------------------------------
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // --------------------------------------------------
    // 3. GET AUTHORIZATION HEADER
    // --------------------------------------------------
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "Missing authorization header",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // --------------------------------------------------
    // 4. VERIFY USER
    // --------------------------------------------------
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("AUTH ERROR:", userError);

      return new Response(
        JSON.stringify({
          error: "Invalid authentication",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    console.log("Authenticated user:", user.id);

    // --------------------------------------------------
    // 5. CHECK ADMIN ROLE
    // --------------------------------------------------
    const { data: adminProfile, error: profileError } =
      await supabase
        .from("profiles")
        .select("id, role, full_name")
        .eq("id", user.id)
        .single();

    if (profileError || !adminProfile) {
      console.error("PROFILE ERROR:", profileError);

      return new Response(
        JSON.stringify({
          error: "Admin profile not found",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (adminProfile.role !== "admin") {
      return new Response(
        JSON.stringify({
          error: "You are not authorized to perform this action",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // --------------------------------------------------
    // 6. READ REQUEST
    // --------------------------------------------------
    const body = await req.json();

    const {
      depositId,
      action,
      planId,
    } = body;

    if (!depositId || !action) {
      return new Response(
        JSON.stringify({
          error: "depositId and action are required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (action !== "approve" && action !== "reject") {
      return new Response(
        JSON.stringify({
          error: "Invalid action",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // --------------------------------------------------
    // 7. GET DEPOSIT
    // --------------------------------------------------
    const { data: deposit, error: depositError } =
      await supabase
        .from("deposits")
        .select("*")
        .eq("id", depositId)
        .single();

    if (depositError || !deposit) {
      console.error("DEPOSIT ERROR:", depositError);

      return new Response(
        JSON.stringify({
          error: "Deposit not found",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Prevent double processing
    if (deposit.status !== "pending") {
      return new Response(
        JSON.stringify({
          error: `Deposit is already ${deposit.status}`,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // --------------------------------------------------
    // 8. UPDATE DEPOSIT STATUS
    // --------------------------------------------------
    const newStatus =
      action === "approve"
        ? "approved"
        : "rejected";

    const { error: updateError } =
      await supabase
        .from("deposits")
        .update({
          status: newStatus,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", depositId);

    if (updateError) {
      console.error("DEPOSIT UPDATE ERROR:", updateError);

      return new Response(
        JSON.stringify({
          error: updateError.message,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // --------------------------------------------------
    // 9. REJECTED
    // --------------------------------------------------
    if (action === "reject") {
      await supabase
        .from("notifications")
        .insert({
          user_id: deposit.user_id,
          type: "deposit",
          title: "Deposit Rejected",
          message: `Your deposit of $${deposit.amount.toLocaleString()} (${deposit.crypto_type}) has been rejected.`,
        });

      return new Response(
        JSON.stringify({
          success: true,
          status: "rejected",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // --------------------------------------------------
    // 10. GET USER PROFILE
    // --------------------------------------------------
    const { data: profile, error: profileFetchError } =
      await supabase
        .from("profiles")
        .select(
          "balance, total_deposits, full_name",
        )
        .eq("id", deposit.user_id)
        .single();

    if (profileFetchError || !profile) {
      console.error(
        "USER PROFILE ERROR:",
        profileFetchError,
      );

      return new Response(
        JSON.stringify({
          error: "User profile not found",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // --------------------------------------------------
    // 11. CREDIT USER
    // --------------------------------------------------
    const newBalance =
      Number(profile.balance || 0) +
      Number(deposit.amount);

    const newTotalDeposits =
      Number(profile.total_deposits || 0) +
      Number(deposit.amount);

    const { error: balanceError } =
      await supabase
        .from("profiles")
        .update({
          balance: newBalance,
          total_deposits: newTotalDeposits,
          updated_at: new Date().toISOString(),
        })
        .eq("id", deposit.user_id);

    if (balanceError) {
      console.error(
        "BALANCE UPDATE ERROR:",
        balanceError,
      );

      return new Response(
        JSON.stringify({
          error: balanceError.message,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // --------------------------------------------------
    // 12. TRANSACTION
    // --------------------------------------------------
    await supabase
      .from("transactions")
      .insert({
        user_id: deposit.user_id,
        type: "deposit",
        amount: deposit.amount,
        status: "approved",
        notes: `Deposit via ${deposit.crypto_type} approved by admin`,
      });

    // --------------------------------------------------
    // 13. OPTIONAL INVESTMENT
    // --------------------------------------------------
    if (planId) {
      const { data: plan } =
        await supabase
          .from("investment_plans")
          .select("*")
          .eq("id", planId)
          .single();

      if (plan) {
        const startDate = new Date();

        const endDate = new Date();

        endDate.setDate(
          endDate.getDate() +
            plan.duration_days,
        );

        const expectedReturn =
          Number(deposit.amount) +
          (Number(deposit.amount) *
            Number(plan.roi_percent)) /
            100;

        const dailyProfit =
          (Number(deposit.amount) *
            Number(plan.roi_percent)) /
          100 /
          Number(plan.duration_days);

        await supabase
          .from("user_investments")
          .insert({
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

        await supabase
          .from("transactions")
          .insert({
            user_id: deposit.user_id,
            type: "investment",
            amount: deposit.amount,
            status: "approved",
            notes: `Investment in ${plan.name}`,
          });

        await supabase
          .from("notifications")
          .insert({
            user_id: deposit.user_id,
            type: "investment",
            title: "Investment Started",
            message: `Your investment of $${deposit.amount.toLocaleString()} in ${plan.name} is now active.`,
          });
      }
    }

    // --------------------------------------------------
    // 14. DEPOSIT NOTIFICATION
    // --------------------------------------------------
    await supabase
      .from("notifications")
      .insert({
        user_id: deposit.user_id,
        type: "deposit",
        title: "Deposit Approved",
        message: `Your deposit of $${deposit.amount.toLocaleString()} (${deposit.crypto_type}) has been approved and credited to your account.`,
      });

    // --------------------------------------------------
    // 15. SUCCESS
    // --------------------------------------------------
    return new Response(
      JSON.stringify({
        success: true,
        status: "approved",
        depositId,
        userId: deposit.user_id,
        amount: deposit.amount,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );

  } catch (error) {
    console.error("🔥 HANDLE DEPOSIT ERROR:", error);

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});