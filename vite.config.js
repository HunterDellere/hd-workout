import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the site at https://hunterdellere.github.io/hd-workout/.
// Production builds and `vite preview` (which serves the built bundle) must
// share the same base so asset URLs in dist/index.html resolve correctly.
// `vite preview` runs with mode='production' by default.
export default defineConfig(({ command, mode }) => ({
  base: command === 'build' || mode === 'production' ? '/hd-workout/' : '/',
  plugins: [react()],
}))
