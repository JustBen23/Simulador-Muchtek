import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base './' -> rutas relativas, sirve igual en local o en un subdirectorio (GitHub Pages)
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    proxy: {
      "/api": {
        target: "https://muchtek.justlayinout.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    assetsInlineLimit: 0, // no incrustar imágenes en base64 -> van a media/
    rollupOptions: {
      output: {
        // Organiza la salida: fuentes en fonts/, imágenes/vídeo en media/, resto en assets/
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || "";
          if (/\.(woff2?|ttf|otf|eot)$/i.test(name))
            return "fonts/[name]-[hash][extname]";
          if (/\.(png|jpe?g|gif|svg|webp|avif|mp4|webm)$/i.test(name))
            return "media/[name]-[hash][extname]";
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
});
