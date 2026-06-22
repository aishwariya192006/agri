import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDeploy = env.VITE_API_URL?.startsWith('https://')

  return {
    plugins: [react()],
    server: {
      port: 5174,
      proxy: isDeploy ? {} : {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
