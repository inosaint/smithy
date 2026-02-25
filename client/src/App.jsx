import React, { useState, useCallback, useRef } from 'react'
import Header from './components/Header.jsx'
import Onboarding from './components/Onboarding.jsx'
import LandingPage from './components/LandingPage.jsx'
import ChatPanel from './components/ChatPanel.jsx'
import PreviewPanel from './components/PreviewPanel.jsx'
import Confetti from './components/Confetti.jsx'
import { useProject } from './hooks/useProject.js'
import { hasProjects, listProjects } from './services/projectStorage.js'

export default function App() {
  const [screen, setScreen] = useState(() => hasProjects() ? 'landing' : 'onboarding')
  const [showPreview, setShowPreview] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [projectList, setProjectList] = useState(() => listProjects())
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [chatWidth, setChatWidth] = useState(42) // percentage
  const [isResizing, setIsResizing] = useState(false)
  const layoutRef = useRef(null)
  const project = useProject()

  const handleResizeStart = useCallback((e) => {
    e.preventDefault()
    setIsResizing(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const onMove = (e) => {
      if (!layoutRef.current) return
      const rect = layoutRef.current.getBoundingClientRect()
      const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left
      const pct = Math.min(75, Math.max(25, (x / rect.width) * 100))
      setChatWidth(pct)
    }
    const onUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove)
    window.addEventListener('touchend', onUp)
  }, [])

  // When first code arrives from generation, auto-show preview + confetti
  const prevCodeRef = React.useRef('')
  const wasGenerating = React.useRef(false)
  React.useEffect(() => {
    // Only trigger confetti when generation just finished producing new code
    if (wasGenerating.current && !project.isGenerating && project.currentCode && !prevCodeRef.current) {
      setShowPreview(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 4000)
    }
    if (!project.isGenerating) {
      prevCodeRef.current = project.currentCode
    }
    wasGenerating.current = project.isGenerating
  }, [project.isGenerating, project.currentCode])

  const handleOnboardingComplete = useCallback((prompt, name) => {
    if (name) project.setProjectName(name)
    setScreen('building')
    project.sendMessage(prompt)
  }, [project])

  const handleNewProject = useCallback(() => {
    project.reset()
    setScreen('onboarding')
    setShowPreview(false)
  }, [project])

  const handleSelectProject = useCallback((projectId) => {
    project.loadProject(projectId)
    setScreen('building')
    setShowPreview(true)
  }, [project])

  const handleGoHome = useCallback(() => {
    setProjectList(listProjects())
    setScreen(hasProjects() ? 'landing' : 'onboarding')
  }, [])

  const handleProjectsChange = useCallback(() => {
    const updated = listProjects()
    setProjectList(updated)
    if (updated.length === 0) setScreen('onboarding')
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: screen === 'building'
        ? 'var(--bg-primary)'
        : 'linear-gradient(160deg, #fafaf8 0%, #fef3e7 30%, #f5f3ef 60%, #eef9f3 100%)',
      transition: 'background 0.5s ease',
    }}>
      {showConfetti && <Confetti />}

      <Header
        screen={screen}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(p => !p)}
        onNewProject={handleNewProject}
        onGoHome={handleGoHome}
        hasCode={!!project.currentCode}
        projectName={project.projectName}
        onboardingStep={screen === 'onboarding' ? onboardingStep + 1 : null}
        onboardingTotalSteps={5}
      />

      {screen === 'landing' ? (
        <LandingPage
          projects={projectList}
          onNewProject={handleNewProject}
          onSelectProject={handleSelectProject}
          onProjectsChange={handleProjectsChange}
        />
      ) : screen === 'onboarding' ? (
        <Onboarding onComplete={handleOnboardingComplete} onGoHome={hasProjects() ? handleGoHome : null} onStepChange={setOnboardingStep} />
      ) : (
        <div ref={layoutRef} className="building-layout" style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}>
          <div className="chat-pane" style={{
            width: showPreview ? `${chatWidth}%` : '100%',
            flex: showPreview ? 'none' : '1 1 100%',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}>
            <ChatPanel
              messages={project.messages}
              isGenerating={project.isGenerating}
              onSendMessage={project.sendMessage}
              hasCode={!!project.currentCode}
              showPreview={showPreview}
              onTogglePreview={() => setShowPreview(p => !p)}
              onDeploy={project.deploy}
              isDeploying={project.isDeploying}
            />
          </div>

          {showPreview && (
            <>
            <div
              onMouseDown={handleResizeStart}
              onTouchStart={handleResizeStart}
              className="resize-handle"
              style={{
                width: 6,
                cursor: 'col-resize',
                background: 'var(--border-default)',
                flexShrink: 0,
                position: 'relative',
                zIndex: 10,
                transition: 'background 0.15s ease',
              }}
            >
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 4,
                height: 32,
                borderRadius: 2,
                background: 'var(--border-strong)',
                opacity: 0.4,
              }} />
            </div>
            <div className="preview-pane" style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              position: 'relative',
            }}>
              {isResizing && <div style={{ position: 'absolute', inset: 0, zIndex: 50 }} />}
              <PreviewPanel
                code={project.currentCode}
                isGenerating={project.isGenerating}
                onDeploy={project.deploy}
                isDeploying={project.isDeploying}
                deployUrl={project.deployUrl}
                claimUrl={project.claimUrl}
              />
            </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
