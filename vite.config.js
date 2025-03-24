import { defineConfig } from 'vite';

export default defineConfig({
  // 設定 public 目錄下的資源路徑
  base: './',  // 設定為相對路徑（適用於某些部署情況）
  build: {
    rollupOptions: {
        input: {
            main: './index.html',
            todolist: './src/todolist.html',
          }      
    }
  }
});