import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/solideo-Day2-01-15-Practice/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
