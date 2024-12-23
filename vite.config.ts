import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react-swc'
import path             from 'path'

import postcssNesting   from 'postcss-nesting'
import autoprefixer     from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        postcssNesting(),
        autoprefixer()
      ]
    }
  },
  resolve: {
    alias: {
      '@'           : path.resolve(__dirname, './src'),
      '@assets'     : path.resolve(__dirname, './src/assets'),
      '@components' : path.resolve(__dirname, './src/components'),
      '@data'       : path.resolve(__dirname, './src/data.ts'),
      '@styles'     : path.resolve(__dirname, './src/styles'),
      '@types'      : path.resolve(__dirname, './src/types.ts'),
    },
  },
})
