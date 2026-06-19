/**
 * Unified environment check — reports every blocker with fix instructions.
 */
const checks: { name: string; ok: boolean; fix?: string }[] = [];

function isSet(name: string): boolean {
  const v = process.env[name];
  return Boolean(v && !/^CHANGE_ME/i.test(v));
}

function record(name: string, fix?: string) {
  const ok = isSet(name);
  checks.push({ name, ok, fix });
  return ok;
}

async function sanityChecks() {
  const token = process.env.SANITY_API_TOKEN;
  if (!token || /^CHANGE_ME/i.test(token)) {
    checks.push({
      name: "SANITY_API_TOKEN",
      ok: false,
      fix: "Add token from https://www.sanity.io/manage/project/jyppkgsk/api#tokens",
    });
    return;
  }

  try {
    const { createClient } = await import("@sanity/client");
    const sanity = createClient({
      projectId: process.env.SANITY_PROJECT_ID || "jyppkgsk",
      dataset: process.env.SANITY_DATASET || "production",
      apiVersion: "2024-01-01",
      token,
      useCdn: false,
    });
    const count = await sanity.fetch<number>(`count(*[_type == "article"])`);
    checks.push({
      name: "SANITY read access",
      ok: true,
      fix: `${count} articles visible`,
    });

    const id = "env-check-write-test";
    try {
      await sanity.createOrReplace({
        _id: id,
        _type: "agentSmokeTest",
        createdAt: new Date().toISOString(),
      });
      await sanity.delete(id);
      checks.push({ name: "SANITY write access", ok: true });
    } catch {
      checks.push({
        name: "SANITY write access",
        ok: false,
        fix:
          "Current token is read-only. Create an Editor token at sanity.io/manage → API → Tokens. Required for newsletter subscribe, podcast generation, and video patch.",
      });
    }
  } catch (e) {
    checks.push({
      name: "SANITY connection",
      ok: false,
      fix: (e as Error).message,
    });
  }
}

async function resendCheck() {
  if (!record("RESEND_API_KEY", "https://resend.com/api-keys")) return;
  record("RESEND_FROM_EMAIL");
  try {
    const base = (process.env.RESEND_BASE_URL ?? "https://api.resend.com").replace(
      /\/$/,
      "",
    );
    const res = await fetch(`${base}/domains`, {
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      checks.push({
        name: "RESEND API",
        ok: false,
        fix: `HTTP ${res.status} — verify key at resend.com`,
      });
      return;
    }
    const body = (await res.json()) as { data?: { name?: string; status?: string }[] };
    const domains = body.data ?? [];
    checks.push({
      name: "RESEND API",
      ok: true,
      fix: domains.map((d) => `${d.name}: ${d.status}`).join(", ") || "connected",
    });
  } catch (e) {
    checks.push({ name: "RESEND API", ok: false, fix: (e as Error).message });
  }
}

async function main() {
  console.log("PrimeAxis environment check\n");

  record("SANITY_PROJECT_ID");
  record("CLOUDINARY_URL");
  record("ELEVENLABS_API_KEY", "https://elevenlabs.io/app/settings/api-keys");
  record("PODCAST_SITE_URL");
  record("PODCAST_FEED_URL");
  record("PUBLIC_SITE_URL");

  const proxy = process.env.API_PROXY_TARGET ?? "";
  const proxyOk = /localhost|127\.0\.0\.1/i.test(proxy);
  checks.push({
    name: "API_PROXY_TARGET (local dev)",
    ok: proxyOk,
    fix: proxyOk
      ? undefined
      : `Set API_PROXY_TARGET=http://localhost:5000 (currently: ${proxy || "unset"})`,
  });

  await sanityChecks();
  await resendCheck();

  let fail = 0;
  for (const c of checks) {
    const icon = c.ok ? "OK  " : "FAIL";
    console.log(`${icon} ${c.name}${c.fix ? ` — ${c.fix}` : ""}`);
    if (!c.ok) fail++;
  }

  console.log(
    fail === 0
      ? "\nAll checks passed."
      : `\n${fail} issue(s) need attention. Videos still play via API fallback when Sanity videoUrl is unset.`,
  );
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error((e as Error).message);
  process.exit(1);
});

export {};
