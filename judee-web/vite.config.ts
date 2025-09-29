import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import commonjs from 'vite-plugin-commonjs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), commonjs()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@components': path.resolve(__dirname, 'src/components'),
      "@context": path.resolve(__dirname, 'src/context'),
      "@pages": path.resolve(__dirname, 'src/pages'),
      "@constants": path.resolve(__dirname, 'src/constants.tsx'),
    }
  }
})
