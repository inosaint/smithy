import express from 'express'
import cors from 'cors'
import { generateRoute } from './routes/generate.js'
import { deployRoute } from './routes/deploy.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// API routes
app.use('/api/generate', generateRoute)
app.use('/api/deploy', deployRoute)

// Serve static client in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`⚡ AppForge server running on http://localhost:${PORT}`)
})
