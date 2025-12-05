import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Versão de configuração mais simples e robusta
export default defineConfig({
  // Plugin essencial para o React com SWC
  plugins: [react()], 

  resolve: {
    alias: {
      // Mantém apenas o alias necessário para "@/"
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Mantemos a correção de performance para o Admin e gráficos
  build: {
    // Define o limite de chunk size para 1MB (1000KB)
    chunkSizeWarningLimit: 1000, 
  },
});
