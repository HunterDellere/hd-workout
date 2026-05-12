import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the site at https://hunterdellere.github.io/hd-workout/
// so we set a matching base for production builds.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/hd-workout/' : '/',
  plugins: [react()],
}))
