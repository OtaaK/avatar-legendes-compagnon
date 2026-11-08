import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { fileURLToPath } from "node:url";
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  base: "./",
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: {
    outDir: "../../dist/companion",
    emptyOutDir: true,
    assetsInlineLimit: Infinity,
  },
});
