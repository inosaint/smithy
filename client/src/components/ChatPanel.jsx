import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Sparkles, Eye, Rocket, Code2, Check } from 'lucide-react'

export default function ChatPanel({ messages, isGenerating, onSendMessage, hasCode, showPreview, onTogglePreview, onDeploy, isDeploying }) {
  const [input, setInput] = useState('')
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = () => {
    if (!input.trim() || isGenerating) return
    onSendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Quick suggestion chips
  const suggestions = [
    'Make the colors bolder',
    'Add more animations',
    'Change the font to something fun',
    'Add a dark mode',
    'Make the buttons rounder',
  ]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-secondary)',
    }}>
      {/* Messages */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px 18px',
      }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {/* Action buttons after code is generated */}
        {messages.length >= 2 && !isGenerating && hasCode && !showPreview && (
          <div style={{
            display: 'flex',
            gap: 8,
            marginTop: 4,
            marginBottom: 12,
            paddingLeft: 42,
            animation: 'fadeInUp 0.3s ease-out 0.2s both',
          }}>
            <button
              onClick={onTogglePreview}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                boxShadow: 'var(--shadow-accent)',
                border: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Eye size={15} />
              View Preview
            </button>
            <button
              onClick={onDeploy}
              disabled={isDeploying}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--accent)',
                background: 'var(--accent-lighter)',
                border: '1.5px solid var(--accent-light)',
                transition: 'all 0.15s ease',
              }}
            >
              <Rocket size={14} />
              {isDeploying ? 'Deploying...' : 'Deploy'}
            </button>
          </div>
        )}

        {/* Suggestion chips — only shown when preview is open */}
        {messages.length >= 2 && !isGenerating && hasCode && showPreview && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginTop: 4,
            marginBottom: 12,
            paddingLeft: 42,
            animation: 'fadeInUp 0.3s ease-out 0.2s both',
          }}>
            {suggestions.slice(0, 3).map((s, i) => (
              <button
                key={i}
                onClick={() => onSendMessage(s)}
                style={{
                  padding: '6px 13px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--accent)',
                  background: 'var(--accent-lighter)',
                  border: '1.5px solid transparent',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent-light)'
                  e.currentTarget.style.transform = 'scale(1.03)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px 18px',
        borderTop: '1px solid var(--border-default)',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(8px)',
      }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 8,
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--border-default)',
            padding: 5,
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--accent-light)'
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-bg)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'var(--border-default)'
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isGenerating ? 'Building your magic... ✨' : 'Tell me what to change...'}
            disabled={isGenerating}
            rows={1}
            style={{
              flex: 1,
              resize: 'none',
              padding: '10px 14px',
              fontSize: 15,
              fontWeight: 500,
              lineHeight: 1.5,
              minHeight: 42,
              maxHeight: 120,
              opacity: isGenerating ? 0.5 : 1,
            }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isGenerating}
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              margin: 2,
              background: input.trim() && !isGenerating
                ? 'linear-gradient(135deg, var(--accent), var(--pink))'
                : 'var(--border-subtle)',
              color: input.trim() && !isGenerating ? '#fff' : 'var(--text-tertiary)',
              transition: 'all 0.2s ease',
              boxShadow: input.trim() && !isGenerating ? 'var(--shadow-accent)' : 'none',
            }}
          >
            {isGenerating ? (
              <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function CodeProgressCard({ status, codeBytes }) {
  const isBuilding = status === 'building'
  const steps = [
    { label: 'Generating HTML structure', threshold: 500 },
    { label: 'Adding styles & layout', threshold: 2000 },
    { label: 'Writing interactions', threshold: 4000 },
    { label: 'Finishing touches', threshold: 6000 },
  ]

  // Determine which step we're on based on bytes written
  let activeStep = 0
  for (let i = 0; i < steps.length; i++) {
    if ((codeBytes || 0) >= steps[i].threshold) activeStep = i + 1
  }
  if (!isBuilding) activeStep = steps.length // all done

  return (
    <div style={{
      marginTop: 10,
      padding: '14px 16px',
      borderRadius: 'var(--radius-md)',
      background: isBuilding
        ? 'linear-gradient(135deg, var(--accent-bg), var(--accent-lighter))'
        : 'linear-gradient(135deg, #eef9f3, #d4f0e3)',
      border: `1.5px solid ${isBuilding ? 'var(--accent-light)' : 'rgba(45,157,111,0.25)'}`,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Shimmer overlay while building */}
      {isBuilding && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
          animation: 'shimmer 2s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, position: 'relative' }}>
        <div style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: isBuilding
            ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))'
            : 'linear-gradient(135deg, var(--green), #2d9d6f)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {isBuilding ? (
            <Code2 size={14} color="#fff" style={{ animation: 'spin 2s linear infinite' }} />
          ) : (
            <Check size={14} color="#fff" strokeWidth={3} />
          )}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: isBuilding ? 'var(--accent-dark)' : 'var(--green)' }}>
            {isBuilding ? 'Building your site...' : 'Site ready!'}
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', marginTop: 1 }}>
            {isBuilding
              ? `${((codeBytes || 0) / 1024).toFixed(1)} KB written`
              : 'Code generated successfully'}
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
        {steps.map((step, i) => {
          const isDone = i < activeStep
          const isCurrent = i === activeStep && isBuilding
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: isDone
                  ? (isBuilding ? 'var(--accent)' : 'var(--green)')
                  : isCurrent ? 'var(--accent-lighter)' : 'var(--border-default)',
                transition: 'all 0.3s ease',
              }}>
                {isDone ? (
                  <Check size={10} color="#fff" strokeWidth={3} />
                ) : isCurrent ? (
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--accent)',
                    animation: 'pulse 1s ease-in-out infinite',
                  }} />
                ) : (
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-tertiary)', opacity: 0.4 }} />
                )}
              </div>
              <span style={{
                fontSize: 12,
                fontWeight: isDone || isCurrent ? 600 : 500,
                color: isDone
                  ? (isBuilding ? 'var(--accent-dark)' : 'var(--green)')
                  : isCurrent ? 'var(--text-primary)' : 'var(--text-tertiary)',
                transition: 'all 0.3s ease',
              }}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div style={{
      display: 'flex',
      gap: 10,
      marginBottom: 18,
      animation: 'fadeInUp 0.3s ease-out',
    }}>
      {/* Avatar */}
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 'var(--radius-sm)',
        background: isUser
          ? 'linear-gradient(135deg, var(--blue), #6a9fd8)'
          : 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 2,
        fontSize: 15,
        boxShadow: isUser
          ? '0 2px 8px rgba(74,143,214,0.3)'
          : '0 2px 8px rgba(224,122,47,0.3)',
      }}>
        {isUser ? '🧑' : '✨'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--text-tertiary)',
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {isUser ? 'You' : 'AppForge'}
        </div>
        <div style={{
          padding: '12px 16px',
          borderRadius: isUser ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
          background: isUser ? 'var(--bg-chat-user)' : 'var(--bg-card)',
          border: isUser ? 'none' : '1px solid var(--border-default)',
          boxShadow: isUser ? 'none' : 'var(--shadow-sm)',
          fontSize: 14,
          lineHeight: 1.65,
          fontWeight: 500,
          color: message.isError ? '#ef4444' : 'var(--text-primary)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {message.content || (
            <span style={{ display: 'inline-flex', gap: 5, color: 'var(--text-tertiary)' }}>
              <span style={{ animation: 'pulse 1.4s ease-in-out infinite' }}>✦</span>
              <span style={{ animation: 'pulse 1.4s ease-in-out 0.2s infinite' }}>✦</span>
              <span style={{ animation: 'pulse 1.4s ease-in-out 0.4s infinite' }}>✦</span>
            </span>
          )}
          {message.isStreaming && !message.codeStatus && (
            <span style={{
              display: 'inline-block',
              width: 2,
              height: 18,
              background: 'var(--accent)',
              marginLeft: 3,
              borderRadius: 1,
              animation: 'pulse 0.6s ease-in-out infinite',
              verticalAlign: 'text-bottom',
            }} />
          )}
          {message.codeStatus && (
            <CodeProgressCard status={message.codeStatus} codeBytes={message.codeBytes} />
          )}
        </div>
      </div>
    </div>
  )
}
