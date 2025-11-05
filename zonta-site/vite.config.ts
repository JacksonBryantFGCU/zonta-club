<<<<<<< HEAD
import { defineConfig } from 'vite'
=======
import { defineConfig } from 'vitest/config'
>>>>>>> admin-update
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
<<<<<<< HEAD
=======
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
>>>>>>> admin-update
  }
})
