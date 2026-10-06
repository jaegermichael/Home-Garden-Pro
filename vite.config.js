import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

function routePages(root) {
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name === "index.html")
    .map((entry) => ({
      route: dirname(relative(root, join(entry.parentPath, entry.name))),
      source: join(entry.parentPath, entry.name),
    }));
}

function emitRouteFallbacks() {
  return {
    name: "emit-route-fallbacks",
    closeBundle() {
      const projectRoot = process.cwd();
      const legacyRoot = join(projectRoot, "legacy-pages");
      const rootTarget = join(projectRoot, "dist", "index.html");
      const shell = readFileSync(rootTarget, "utf8");
      const shellHead = shell.match(/<head>([\s\S]*?)<\/head>/i)?.[1] || "";
      const bundleTags = [...shellHead.matchAll(/<(?:script|link)\b[^>]*\/assets\/index-[^>]+>(?:<\/script>)?/gi)]
        .map((match) => match[0])
        .join("\n");
      const pages = [{ route: "", source: join(legacyRoot, "home.html") }, ...routePages(legacyRoot)];

      for (const { route, source } of pages) {
        const legacy = readFileSync(source, "utf8");
        const legacyHead = legacy.match(/<head>([\s\S]*?)<\/head>/i)?.[1] || "";
        const legacyBody = legacy.split(/<\/head>/i)[1] || "";
        const structuredData = [...legacyBody.matchAll(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi)]
          .map((match) => match[0])
          .join("\n");
        const replacementHead = `<head>${legacyHead}\n${structuredData}\n${bundleTags}</head>`;
        const html = shell.replace(/<head>[\s\S]*?<\/head>/i, () => replacementHead);
        const target = join(projectRoot, "dist", route, "index.html");
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, html);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), emitRouteFallbacks()],
  publicDir: ".react-public",
  build: { outDir: "dist", emptyOutDir: true },
});
