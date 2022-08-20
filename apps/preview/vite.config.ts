import { defineConfig, Plugin } from 'vite'
import preact from '@preact/preset-vite'
import historyApiFallback from 'connect-history-api-fallback'

function mdBookPlugin(): Plugin {
  return {
    name: 'vite-plugin-mdbook',
    configureServer(server) {
      return () => {
        server.middlewares.use(historyApiFallback({ disableDotRule: true }))
      }
    },
  }
}

export default defineConfig({
  plugins: [preact(), mdBookPlugin()],
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
})
