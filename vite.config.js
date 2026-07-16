import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/transliterate': {
        target: 'https://inputtools.google.com',
        changeOrigin: true,
        rewrite: (path) => {
          const urlObj = new URL(path, 'http://localhost');
          const text = urlObj.searchParams.get('text') || '';
          return `/request?text=${encodeURIComponent(text)}&ime=transliteration_en_mr&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=jsapi`;
        }
      }
    }
  }
})
