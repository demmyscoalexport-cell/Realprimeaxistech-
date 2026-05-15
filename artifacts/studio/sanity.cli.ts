import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "jyppkgsk",
    dataset: "production",
  },
  vite: (config) => {
    return {
      ...config,
      server: {
        ...(config.server ?? {}),
        host: "0.0.0.0",
        allowedHosts: true,
        hmr: { clientPort: 443, protocol: "wss" },
      },
    };
  },
});
