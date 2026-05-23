/**
 * Cross-platform preinstall guard — enforces pnpm without requiring bash/sh.
 */
const ua = process.env.npm_config_user_agent ?? "";

if (!ua.includes("pnpm")) {
  console.error("Use pnpm instead of npm/yarn for this workspace.");
  process.exit(1);
}
