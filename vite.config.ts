import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Immer derselbe Port → einmalig in Google Cloud als Referrer eintragen.
    // `npm run dev` beendet vorher einen alten Prozess auf 5173.
    strictPort: true,
  },
})
