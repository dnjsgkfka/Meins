import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/dev-proxy': {
        target: 'https://meinsbackend-production.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev-proxy/, ''),
      },
    },
  },
})
