import { useState, useCallback, useRef, useEffect } from 'react'
import { saveProject as persistProject, getProject as loadStoredProject } from '../services/projectStorage.js'

// Build a display version of the response that hides code blocks
// Returns { text, codeStatus } where codeStatus is null | 'building' | 'ready'
function buildDisplayText(fullText) {
  const openIdx = fullText.indexOf('```html')
  if (openIdx === -1) return { text: fullText, codeStatus: null }

  const before = fullText.slice(0, openIdx).trimEnd()
  const closeIdx = fullText.indexOf('```', openIdx + 7)

  if (closeIdx === -1) {
    // Still inside code block — estimate progress from content length
    const codeLength = fullText.length - openIdx - 7
    return { text: before, codeStatus: 'building', codeBytes: codeLength }
  }

  // Code block is closed, include any text after it
  const after = fullText.slice(closeIdx + 3)
  return { text: (before + after).trim(), codeStatus: 'ready' }
}

export function useProject() {
  const [messages, setMessages] = useState([])
  const [currentCode, setCurrentCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployUrl, setDeployUrl] = useState(null)
  const [claimUrl, setClaimUrl] = useState(null)
  const [projectId, setProjectId] = useState(null)
  const [projectName, setProjectName] = useState(null)
  const abortRef = useRef(null)

  // Auto-save to localStorage when project state changes
  useEffect(() => {
    if (!projectId) return
    // Save only finalized messages (not mid-stream) to keep storage clean
    const savedMessages = messages
      .filter(m => !m.isStreaming)
      .map(({ role, content, timestamp, codeStatus, isError }) => ({
        role, content, timestamp,
        ...(codeStatus ? { codeStatus } : {}),
        ...(isError ? { isError } : {}),
      }))
    persistProject({
      id: projectId,
      name: projectName || `Project ${projectId.slice(0, 6)}`,
      code: currentCode,
      deployUrl,
      claimUrl,
      messages: savedMessages,
      messageCount: savedMessages.length,
    })
  }, [projectId, currentCode, deployUrl, claimUrl, projectName, messages])

  const loadProject = useCallback((id) => {
    const stored = loadStoredProject(id)
    if (!stored) return false
    setProjectId(stored.id)
    setProjectName(stored.name)
    setCurrentCode(stored.code || '')
    setDeployUrl(stored.deployUrl || null)
    setClaimUrl(stored.claimUrl || null)
    setMessages(stored.messages || [])
    setIsGenerating(false)
    setIsDeploying(false)
    return true
  }, [])

  const sendMessage = useCallback(async (content) => {
    const userMsg = { role: 'user', content, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setIsGenerating(true)

    const assistantMsg = { role: 'assistant', content: '', timestamp: Date.now(), isStreaming: true }
    setMessages(prev => [...prev, assistantMsg])

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          message: content,
          currentCode,
        }),
      })

      if (!res.ok) throw new Error('Generation failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''
      let extractedCode = ''
      let newProjectId = projectId

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)

          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)

            if (parsed.type === 'project_id') {
              newProjectId = parsed.id
              setProjectId(parsed.id)
            } else if (parsed.type === 'text') {
              fullResponse += parsed.content
              const { text, codeStatus, codeBytes } = buildDisplayText(fullResponse)
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: text,
                  codeStatus,
                  codeBytes: codeBytes || 0,
                }
                return updated
              })
            } else if (parsed.type === 'code') {
              extractedCode = parsed.content
              setCurrentCode(parsed.content)
            }
          } catch (e) {
            // skip unparseable chunks
          }
        }
      }

      // Finalize message with clean display text
      const { text: finalDisplay, codeStatus: finalCodeStatus } = buildDisplayText(fullResponse)
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: finalDisplay,
          codeStatus: finalCodeStatus,
          isStreaming: false,
        }
        return updated
      })
    } catch (err) {
      console.error('Generation error:', err)
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
          timestamp: Date.now(),
          isError: true,
        }
        return updated
      })
    } finally {
      setIsGenerating(false)
    }
  }, [projectId, currentCode])

  const deploy = useCallback(async () => {
    if (!currentCode || isDeploying) return
    setIsDeploying(true)

    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          code: currentCode,
        }),
      })

      if (!res.ok) throw new Error('Deploy failed')

      const data = await res.json()
      setDeployUrl(data.url)
      if (data.claimUrl) setClaimUrl(data.claimUrl)
    } catch (err) {
      console.error('Deploy error:', err)
    } finally {
      setIsDeploying(false)
    }
  }, [currentCode, projectId, isDeploying])

  const reset = useCallback(() => {
    setMessages([])
    setCurrentCode('')
    setIsGenerating(false)
    setIsDeploying(false)
    setDeployUrl(null)
    setClaimUrl(null)
    setProjectId(null)
    setProjectName(null)
  }, [])

  return {
    messages,
    currentCode,
    isGenerating,
    isDeploying,
    deployUrl,
    claimUrl,
    projectId,
    projectName,
    setProjectName,
    sendMessage,
    deploy,
    reset,
    loadProject,
  }
}
