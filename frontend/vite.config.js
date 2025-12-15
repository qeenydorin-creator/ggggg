import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 配置
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['framer-motion', 'lucide-react'], // 外部化 framer-motion 和 lucide-react
    },
  },
});
