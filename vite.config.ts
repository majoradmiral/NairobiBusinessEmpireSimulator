import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  worker: { format: 'es' },
  // DuckDB-WASM is loaded lazily; excluding it from prebundling avoids worker/PThread issues.
  optimizeDeps: { exclude: ['@duckdb/duckdb-wasm'] },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-dom') || id.includes('react/') || id.includes('scheduler')) return 'react';
          if (id.includes('leaflet')) return 'maps';
          if (id.includes('/d3-') || id.includes('/d3/')) return 'charts';
          return undefined;
        },
      },
    },
  },
});
