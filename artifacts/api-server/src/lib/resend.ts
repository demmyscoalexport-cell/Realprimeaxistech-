const resendApiKey = process.env.RESEND_API_KEY;
const resendBaseUrl = (process.env.RESEND_BASE_URL ?? "https://api.resend.com")
  .replace(/\/$/, "");
const resendFromEmail = process.env.RESEND_FROM_EMAIL;
const resendReplyTo = process.env.RESEND_REPLY_TO;

type ResendEmailPayload = {
  from: string;
  to: string[];
  subject: string;
  text: string;
  html?: string;
  reply_to?: string[];
};

type ResendEmailResponse = {
  id?: string;
  message?: string;
  name?: string;
};

export function isResendConfigured(): boolean {
  return Boolean(resendApiKey && resendFromEmail);
}

export async function sendNewsletterWelcomeEmail(opts: {
  email: string;
  newsletterSlug: string;
}): Promise<void> {
  if (!isResendConfigured()) return;

  const newsletterName = opts.newsletterSlug
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
  const displayName = newsletterName || "PrimeAxis Tech";
  const subject = `Welcome to ${displayName}`;
  const text = `You're subscribed to ${displayName} from PrimeAxis Tech.\n\nThanks for joining. You'll receive concise, editorial technology coverage from our newsroom.\n\nPrimeAxis Tech`;
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111827">
      <p>You're subscribed to <strong>${escapeHtml(displayName)}</strong> from PrimeAxis Tech.</p>
      <p>Thanks for joining. You'll receive concise, editorial technology coverage from our newsroom.</p>
      <p style="color:#6b7280">PrimeAxis Tech</p>
    </div>
  `;

  await sendEmail({
    from: resendFromEmail as string,
    to: [opts.email],
    subject,
    text,
    html,
    ...(resendReplyTo ? { reply_to: [resendReplyTo] } : {}),
  });
}

async function sendEmail(payload: ResendEmailPayload): Promise<void> {
  const response = await fetch(`${resendBaseUrl}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "primeaxis-api/1.0",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ResendEmailResponse;
    throw new Error(
      body.message ??
        body.name ??
        `Resend email request failed with ${response.status}`,
    );
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
