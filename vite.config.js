import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// Inline CSS utama ke index.html agar tidak ada stylesheet yang memblokir render
// dan tidak ada request tambahan. CSS chunk lazy (editor Markdown) tetap terpisah.
function inlineEntryCss() {
  return {
    name: 'inline-entry-css',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html
        return html.replace(
          /<link rel="stylesheet"[^>]*?href="\/?([^"]+\.css)"[^>]*>/g,
          (match, file) => {
            const asset = ctx.bundle[file]
            return asset && asset.type === 'asset' ? `<style>${asset.source}</style>` : match
          }
        )
      },
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.APP_PORT) || 3000
  const baseUrl = env.VITE_DELCOM_BASEURL || 'https://open-api.delcom.org/api/v1'

  return {
    plugins: [vue(), tailwindcss(), inlineEntryCss()],
    build: {
      sourcemap: true,
    },
    server: {
      port,
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(baseUrl),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.js'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
        include: ['src/**'],
        exclude: [
          'src/main.js',
          '**/*.test.js',
          'src/setupTests.js',
          'src/test-utils.js',
        ],
      },
    },
  }
})
