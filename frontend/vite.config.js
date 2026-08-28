import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://my-ai-chatbot-2-o2pz.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})