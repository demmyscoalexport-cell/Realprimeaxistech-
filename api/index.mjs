let appPromise;

function loadApp() {
  if (!appPromise) {
    appPromise = import("../artifacts/api-server/dist/app.mjs").then(
      ({ default: app }) => app,
    );
  }
  return appPromise;
}

/** Vercel passes Node req/res — invoke Express directly (serverless-http hangs here). */
export default async function vercelHandler(req, res) {
  const app = await loadApp();
  return app(req, res);
}
