# PrimeAxis Tech — Windows quick start
#
# 1. Copy env template and fill in secrets:
#      copy .env.example .env
#
# 2. Install dependencies:
#      pnpm install
#
# 3. Run (each in its own terminal, or use dev.ps1):
#      pnpm dev:api      → http://localhost:5000
#      pnpm dev:site     → http://localhost:5173
#      pnpm dev:studio   → http://localhost:3333
#
# 4. Generate article podcast audio (requires Sanity, Cloudinary, ElevenLabs):
#      pnpm --filter @workspace/scripts run podcasts
#
# 5. Check an Imgix/iMix API key without changing remote state:
#      pnpm --filter @workspace/scripts run imgix:check
#
# 6. Check a Cohere API key without running inference:
#      pnpm --filter @workspace/scripts run cohere:check
#
# Secrets live in .env (gitignored). Never commit real keys to .env.example.
