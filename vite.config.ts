import react from '@vitejs/plugin-react'
import * as path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths: the Power Platform player serves the app from a deep,
  // per-environment/per-app URL, so absolute "/assets/…" paths would 404.
  base: './',
  server: { host: '::', port: 3000 },
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
