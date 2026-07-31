export async function sendEmail({
  to,
  name,
  subject,
  html,
}: {
  to: string;
  name?: string;
  subject: string;
  html: string;
}) {
  const apiKey = Deno.env.get("BREVO_API_KEY");

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey!,
    },
    body: JSON.stringify({
      sender: {
        name: "BlackRocke Capital",
        email: "mail@legithub.xyz",
      },
      to: [
        {
          email: to,
          name: name ?? "",
        },
      ],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    console.error(await res.text());
    throw new Error("Failed to send email");
  }

  return await res.json();
}