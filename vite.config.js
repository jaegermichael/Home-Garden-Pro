import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";

function routeDirectories(root) {
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name === "index.html")
    .map((entry) => dirname(relative(root, join(entry.parentPath, entry.name))));
}

function emitRouteFallbacks() {
  return {
    name: "emit-route-fallbacks",
    closeBundle() {
      const source = join(process.cwd(), "dist", "index.html");
      for (const route of routeDirectories(join(process.cwd(), "legacy-pages"))) {
        const target = join(process.cwd(), "dist", route, "index.html");
        mkdirSync(dirname(target), { recursive: true });
        copyFileSync(source, target);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), emitRouteFallbacks()],
  publicDir: ".react-public",
  build: { outDir: "dist", emptyOutDir: true },
});
