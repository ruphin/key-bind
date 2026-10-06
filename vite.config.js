import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: "key-bind.js",
      formats: ["es"],
      fileName: () => "key-bind.js",
    },
  },
});
