import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { v4 as uuidv4 } from 'uuid'
import { getProject, saveProject } from '../services/projectStore.js'

const router = Router()

const SYSTEM_PROMPT = `You are AppForge, an expert web developer AI that builds beautiful, production-quality landing pages and static web apps.

When the user describes what they want, you MUST:
1. Respond with a brief, conversational explanation of what you're building (2-3 sentences max).
2. Then generate a COMPLETE, self-contained HTML file with embedded CSS and JavaScript.

CRITICAL RULES FOR THE CODE:
- Output the HTML wrapped in exactly these markers:
  \`\`\`html
  (your complete HTML here)
  \`\`\`
- The HTML must be a COMPLETE file starting with <!DOCTYPE html>
- ALL CSS must be inline in a <style> tag in the <head>
- ALL JavaScript must be inline in a <script> tag before </body>
- Use modern CSS (flexbox, grid, custom properties, animations)
- Use Google Fonts via CDN links for beautiful typography
- Make it fully responsive and mobile-friendly
- Use high-quality placeholder images from https://picsum.photos or https://placehold.co
- Include smooth animations and micro-interactions
- The design should look polished and professional, NOT like a template
- Use semantic HTML5 elements
- Include proper meta viewport tag
- NO external CSS or JS files — everything must be self-contained in one HTML file

WHEN USER ASKS FOR CHANGES:
- Apply the changes to the existing code
- Always output the FULL updated HTML file (not just the changed parts)
- Keep all existing functionality unless explicitly asked to remove it

DESIGN QUALITY:
- Use thoughtful color palettes, not generic ones
- Typography should be intentional — pair fonts well
- Spacing should be generous and consistent
- Add subtle shadows, gradients, and borders for depth
- Include hover states and transitions
- Make buttons and interactive elements feel tactile`

export { router as generateRoute }

router.post('/', async (req, res) => {
  const { projectId, message, currentCode } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  // Setup SSE
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  // Get or create project
  const pid = projectId || uuidv4()
  let project = getProject(pid)
  if (!project) {
    project = { id: pid, messages: [], code: '' }
  }

  // Send project ID
  res.write(`data: ${JSON.stringify({ type: 'project_id', id: pid })}\n\n`)

  // Build conversation messages for Claude
  const claudeMessages = []

  // Add conversation history
  for (const msg of project.messages) {
    claudeMessages.push({ role: msg.role, content: msg.content })
  }

  // Build current user message with context
  let userContent = message
  if (currentCode) {
    userContent = `Here is the current code for the app:\n\n\`\`\`html\n${currentCode}\n\`\`\`\n\nUser request: ${message}`
  }
  claudeMessages.push({ role: 'user', content: userContent })

  try {
    const client = new Anthropic({ apiKey })

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: claudeMessages,
    })

    let fullResponse = ''

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.text) {
        const text = event.delta.text
        fullResponse += text
        res.write(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`)
      }
    }

    // Extract code from response
    const codeMatch = fullResponse.match(/```html\n([\s\S]*?)```/)
    if (codeMatch) {
      const extractedCode = codeMatch[1].trim()
      res.write(`data: ${JSON.stringify({ type: 'code', content: extractedCode })}\n\n`)

      // Save project state
      project.messages.push(
        { role: 'user', content: userContent },
        { role: 'assistant', content: fullResponse }
      )
      project.code = extractedCode
      saveProject(project)
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    console.error('Claude API error:', err)
    res.write(`data: ${JSON.stringify({ type: 'text', content: '\n\nSorry, an error occurred while generating. Please try again.' })}\n\n`)
    res.write('data: [DONE]\n\n')
    res.end()
  }
})
