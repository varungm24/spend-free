import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["wallet.svg", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "SpendFree",
        short_name: "SpendFree",
        description: "Manage your finances with clarity and precision.",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        icons: [
          {
            src: "wallet.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "wallet.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
          {
            src: "wallet.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
