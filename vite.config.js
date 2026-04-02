import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content/index.js"),
        background: resolve(__dirname, "src/background.js"),
        popup: resolve(__dirname, "src/popup/index.html"),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "content") return "src/content/index.js";
          if (chunk.name === "background") return "src/background.js";
          return "assets/[name].js";
        },
      },
    },
  },
});
