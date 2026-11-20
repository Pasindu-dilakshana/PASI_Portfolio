import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import fs from 'node:fs'

const CONTENT_FILE = resolve(__dirname, 'src/content/content.json')
const PUBLIC_DIR = resolve(__dirname, 'public')

function readBody(req, limit = 15 * 1024 * 1024) {
  return new Promise((ok, fail) => {
    const chunks = []
    let size = 0
    req.on('data', (c) => {
      size += c.length
      if (size > limit) {
        fail(new Error('Payload too large'))
        req.destroy()
      } else chunks.push(c)
    })
    req.on('end', () => ok(Buffer.concat(chunks)))
    req.on('error', fail)
  })
}

const send = (res, code, obj) => {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(obj))
}

/**
 * Dev-only API used by the /admin dashboard.
 * Lets the dashboard write content.json and upload files straight into the project
 * while `npm run dev` is running. It is never included in the production build.
 */
function adminApi() {
  return {
    name: 'portfolio-admin-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__admin', async (req, res) => {
        try {
          const url = new URL(req.url, 'http://local')
          if (req.method === 'GET' && url.pathname === '/ping') return send(res, 200, { ok: true, mode: 'local' })

          if (url.pathname === '/content') {
            if (req.method === 'GET') return send(res, 200, JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8')))
            if (req.method === 'POST') {
              const data = JSON.parse((await readBody(req)).toString('utf8'))
              fs.writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2) + '\n')
              return send(res, 200, { ok: true })
            }
          }

          if (req.method === 'POST' && url.pathname === '/upload') {
            // path is relative to /public, e.g. "uploads/netflow.webp"
            const rel = (url.searchParams.get('path') || '').replace(/\\/g, '/')
            if (!/^[\w\-./]+$/.test(rel) || rel.includes('..') || rel.startsWith('/'))
              return send(res, 400, { error: 'Invalid file path' })
            const target = resolve(PUBLIC_DIR, rel)
            if (!target.startsWith(PUBLIC_DIR)) return send(res, 400, { error: 'Invalid file path' })
            fs.mkdirSync(resolve(target, '..'), { recursive: true })
            fs.writeFileSync(target, await readBody(req))
            return send(res, 200, { ok: true, url: '/' + rel })
          }

          send(res, 404, { error: 'Not found' })
        } catch (e) {
          send(res, 500, { error: e.message })
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), adminApi()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
      },
    },
  },
})
