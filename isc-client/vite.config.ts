import { defineConfig } from "vite";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "./src/index.ts"),
      name: "isc-client",
      fileName: "isc-client",
      formats: ["es", "cjs"],
    },
  },
  plugins: [dts()],
});
