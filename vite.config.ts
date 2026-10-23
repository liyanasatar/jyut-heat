import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the repo at /jyut-heat/. Local play stays at /.
  base: process.env.BASE_PATH || '/',
})
