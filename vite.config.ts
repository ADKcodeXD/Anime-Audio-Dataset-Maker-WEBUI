import { fileURLToPath, URL } from 'node:url'

import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'

function resovePath(paths: string) {
  // 如何 __dirname 找不到 需要 yarn add @types/node --save-dev
  return resolve(__dirname, paths)
}

export default defineConfig({
  base: '/', // 设置打包路径
  plugins: [
    vue(),
    UnoCSS(),
    AutoImport({
      dts: true,
      dirs: ['src/api'],
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        'vue-i18n',
        'pinia',
        { lodash: [['default', '_']] }
      ]
    }),
    Icons({
      /* options */
    }),
    Components({
      dirs: ['src/components'],
      extensions: ['vue'],
      dts: true
    }),
    vueJsx()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // css
  css: {
    preprocessorOptions: {
      less: {
        charset: false,
        javascriptEnabled: true,
        additionalData: `@import "${resovePath('src/assets/main.scss')}";`
      }
    }
  },
  server: {
    port: 5001,
    proxy: {
      '/api': {
        target: 'http://0.0.0.0:7896/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
