import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Configuração para resolver o '@/' (caminhos absolutos)
      "@": "/src",
    },
  },
  
  // CORREÇÃO: Aumenta o limite de tamanho do arquivo final (chunk)
  build: {
    // O padrão é 500kB. Aumentamos para 1000kB (1MB) para acomodar os gráficos e o Admin.
    chunkSizeWarningLimit: 1000, 
  },
});
