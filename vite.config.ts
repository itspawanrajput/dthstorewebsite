import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProduction = mode === 'production';

  return {
    // Development server configuration
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          secure: false
        }
      }
    },

    // Plugins
    plugins: [react()],

    // Environment variable definitions
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },

    // Path aliases
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },

    // Build optimizations for production
    build: {
      // Output directory
      outDir: 'dist',

      // Generate source maps for debugging (disable in production if needed)
      sourcemap: !isProduction,

      // Minification
      minify: isProduction ? 'esbuild' : false,

      // Target modern browsers for better code
      target: 'es2020',

      // Chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate vendor chunks
            'vendor-react': ['react', 'react-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/auth'],
            'vendor-ui': ['lucide-react'],
          },
          // Asset naming with hash for cache busting
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name?.split('.').pop() || '';
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(extType)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        }
      },

      // Increase chunk size warning limit (KB)
      chunkSizeWarningLimit: 500,
    },

    // Preview server (for testing production build locally)
    preview: {
      port: 4173,
      host: true,
    },

    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react'],
    },
  };
});
