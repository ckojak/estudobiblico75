import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger"; // Mantendo a tagger

// O seu projeto usa a forma de função para obter o 'mode'
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger() // Mantendo a tagger em dev
  ].filter(Boolean),

  resolve: {
    alias: {
      // Unifica as configurações de alias para '@/'
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // CORREÇÃO DE PERFORMANCE: Adiciona o limite de chunk size
  build: {
    // Define o limite de chunk size para 1MB (1000KB)
    chunkSizeWarningLimit: 1000, 
  },
}));
