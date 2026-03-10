import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // For GitHub Pages subdirectory deploy (e.g. yourname.github.io/cash-compass):
  //   base: '/cash-compass/',
  // For root domain or custom domain:
  base: '/',
})
