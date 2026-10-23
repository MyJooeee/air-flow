import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/air-flow/',
  plugins: [react()],
  build: {
    outDir: 'build'
  }
})
