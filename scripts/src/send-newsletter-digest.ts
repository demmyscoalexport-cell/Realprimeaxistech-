import { createClient } from "@sanity/client";

const resendApiKey = process.env.RESEND_API_KEY;
const resendBaseUrl = (process.env.RESEND_BASE_URL ?? "https://api.resend.com").replace(
  /\/$/,
  "",
);
const fromEmail = process.env.RESEND_FROM_EMAIL;
const siteUrl = (process.env.PUBLIC_SITE_URL ?? "https://primeaxishq.com").replace(
  /\/$/,
  "",
);

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? "production";
const sanityToken = process.env.SANITY_API_TOKEN;

const dryRun = process.argv.includes("--dry-run");

if (!dryRun && (!resendApiKey || /^CHANGE_ME/i.test(resendApiKey))) {
  throw new Error("Missing RESEND_API_KEY env");
}
if (!dryRun && !fromEmail) {
  throw new Error("Missing RESEND_FROM_EMAIL env");
}
if (!projectId || !sanityToken) {
  throw new Error("Missing SANITY_PROJECT_ID / SANITY_API_TOKEN env");
}

const sanity = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token: sanityToken,
  useCdn: false,
});

type ArticleRow = {
  slug: string;
  title: string;
  excerpt?: string;
  publishedAt?: string;
};

type SubscriberRow = {
  email: string;
  newsletterSlug?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const newsletterSlug = process.env.NEWSLETTER_SLUG ?? "the-axis";
  const limit = Math.min(Number(process.env.DIGEST_LIMIT ?? "5") || 5, 10);

  const articles = await sanity.fetch<ArticleRow[]>(
    `*[_type == "article" && defined(slug.current)] | order(publishedAt desc) [0...${limit}]{
      "slug": slug.current,
      title,
      excerpt,
      publishedAt
    }`,
  );

  if (!articles.length) {
    throw new Error("No articles found for digest");
  }

  const subscribers = await sanity.fetch<SubscriberRow[]>(
    `*[_type == "newsletterSubscriber" && newsletterSlug == $slug && !defined(unsubscribedAt)]{
      email,
      newsletterSlug
    }[0...500]`,
    { slug: newsletterSlug },
  );

  const subject = `The Axis — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`;
  const storyLines = articles
    .map(
      (a) =>
        `• ${a.title}\n  ${siteUrl}/article/${a.slug}\n  ${a.excerpt ?? ""}`,
    )
    .join("\n\n");

  const sponsorBlock = process.env.DIGEST_SPONSOR_TEXT?.trim();
  const text = [
    "Good morning from PrimeAxis Tech.",
    "",
    sponsorBlock ? `Sponsored by ${sponsorBlock}\n` : "",
    "Today's signal:",
    "",
    storyLines,
    "",
    `Subscribe & manage: ${siteUrl}/newsletters`,
    `Unsubscribe: ${siteUrl}/unsubscribe?newsletter=${encodeURIComponent(newsletterSlug)}&email=EMAIL`,
    "",
    "— PrimeAxis Tech",
  ]
    .filter(Boolean)
    .join("\n");

  const htmlStories = articles
    .map(
      (a) =>
        `<li style="margin-bottom:16px"><a href="${siteUrl}/article/${encodeURIComponent(a.slug)}" style="color:#0ea5e9;font-weight:600;text-decoration:none">${escapeHtml(a.title)}</a><br/><span style="color:#6b7280;font-size:14px">${escapeHtml(a.excerpt ?? "")}</span></li>`,
    )
    .join("");

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px">
      <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:#0ea5e9">The Axis · Daily Briefing</p>
      <h1 style="font-size:22px;margin:8px 0 16px">Today's signal</h1>
      ${sponsorBlock ? `<p style="font-size:13px;color:#6b7280;border-left:3px solid #e5e7eb;padding-left:12px">Sponsored by ${escapeHtml(sponsorBlock)}</p>` : ""}
      <ul style="padding-left:18px">${htmlStories}</ul>
      <p style="font-size:13px;color:#6b7280"><a href="${siteUrl}/newsletters">Newsletters</a> · PrimeAxis Tech</p>
    </div>
  `;

  console.log(`Newsletter: ${newsletterSlug}`);
  console.log(`Articles: ${articles.length}`);
  console.log(`Subscribers: ${subscribers.length}`);
  console.log(`Subject: ${subject}`);

  if (dryRun) {
    console.log("\n--- Preview (text) ---\n");
    console.log(text);
    return;
  }

  if (!subscribers.length) {
    console.log("No subscribers — nothing sent. Use --dry-run to preview.");
    return;
  }

  let sent = 0;
  for (const sub of subscribers) {
    const personalizedText = text.replace(
      "email=EMAIL",
      `email=${encodeURIComponent(sub.email)}`,
    );
    const personalizedHtml = html.replace(
      "email=EMAIL",
      `email=${encodeURIComponent(sub.email)}`,
    );

    const response = await fetch(`${resendBaseUrl}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "primeaxis-scripts/1.0",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [sub.email],
        subject,
        text: personalizedText,
        html: personalizedHtml,
        ...(process.env.RESEND_REPLY_TO
          ? { reply_to: [process.env.RESEND_REPLY_TO] }
          : {}),
      }),
    });

    if (!response.ok) {
      const body = (await response.json()) as { message?: string };
      console.error(`FAIL ${sub.email}: ${body.message ?? response.status}`);
      continue;
    }
    sent++;
    console.log(`Sent ${sub.email}`);
  }

  console.log(`\nDigest complete. ${sent}/${subscribers.length} sent.`);
}

main().catch((err) => {
  console.error((err as Error).message);
  process.exit(1);
});

export {};
