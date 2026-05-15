import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";

const viteAllowAllHosts = (config: Record<string, unknown>) => {
  const server = (config.server as Record<string, unknown> | undefined) ?? {};
  return {
    ...config,
    server: { ...server, allowedHosts: true, host: true },
  };
};

export default defineConfig({
  name: "primeaxis",
  title: "PrimeAxis Tech Newsroom",
  projectId: "jyppkgsk",
  dataset: "production",
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Newsroom")
          .items([
            S.listItem()
              .title("Articles")
              .child(
                S.documentTypeList("article")
                  .title("Articles")
                  .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
              ),
            S.listItem()
              .title("Reviews")
              .child(
                S.documentTypeList("review")
                  .title("Reviews")
                  .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
              ),
            S.listItem()
              .title("Videos")
              .child(
                S.documentTypeList("video")
                  .title("Videos")
                  .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
              ),
            S.divider(),
            S.listItem()
              .title("Authors")
              .child(S.documentTypeList("author").title("Authors")),
            S.listItem()
              .title("Categories")
              .child(S.documentTypeList("category").title("Categories")),
            S.listItem()
              .title("Newsletters")
              .child(S.documentTypeList("newsletter").title("Newsletters")),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
  vite: viteAllowAllHosts,
});
