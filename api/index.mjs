import serverless from "serverless-http";

let handlerPromise;

function loadHandler() {
  if (!handlerPromise) {
    handlerPromise = import("../artifacts/api-server/dist/app.mjs").then(
      ({ default: app }) =>
        serverless(app, {
          request(request, _event, context) {
            if (context && "callbackWaitsForEmptyEventLoop" in context) {
              context.callbackWaitsForEmptyEventLoop = false;
            }
            request.apiGateway = request.apiGateway ?? { event: _event, context };
          },
        }),
    );
  }
  return handlerPromise;
}

export default async function vercelHandler(req, res) {
  const handler = await loadHandler();
  return handler(req, res);
}
