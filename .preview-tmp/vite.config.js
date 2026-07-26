import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const root = path.resolve(__dirname, '..');

export default defineConfig({
  root,
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@\/api\/base44Client$/,
        replacement: path.resolve(__dirname, './mockClient.js'),
      },
      { find: '@', replacement: path.resolve(root, './src') },
    ],
  },
  server: { port: 5199, strictPort: true },
});
