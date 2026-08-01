import { sendEmail } from "../_shared/brevo.ts";

import { signupTemplate } from "../_shared/templates/signup.ts";
import { depositApprovedTemplate } from "../_shared/templates/deposite-approved.ts";
import { withdrawalApprovedTemplate } from "../_shared/templates/withdrawal-approved.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const { type, email, fullName, amount, currency } = await req.json();

    let subject = "";
    let html = "";

    switch (type) {
      case "signup":
        subject = "Welcome to Blackgold invests";
        html = signupTemplate(fullName);
        break;

      case "deposit-approved":
        subject = "Deposit Approved";
        html = depositApprovedTemplate(
          fullName,
          amount,
          currency ?? "$"
        );
        break;

      case "withdrawal-approved":
        subject = "Withdrawal Approved";
        html = withdrawalApprovedTemplate(
          fullName,
          amount,
          currency ?? "$"
        );
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid email type" }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
    }

    await sendEmail({
      to: email,
      name: fullName,
      subject,
      html,
    });

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});