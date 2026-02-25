import React, { useState } from 'react'
import { ArrowRight, ArrowLeft, Rocket } from 'lucide-react'

const PROJECT_TYPES = [
  { id: 'portfolio', emoji: '🎨', label: 'Portfolio', desc: 'Show off your work' },
  { id: 'club', emoji: '🏀', label: 'Club / Team', desc: 'For your school club or team' },
  { id: 'event', emoji: '🎉', label: 'Event Page', desc: 'Party, fundraiser, or meetup' },
  { id: 'store', emoji: '🛍️', label: 'Mini Store', desc: 'Sell your stuff' },
  { id: 'blog', emoji: '✍️', label: 'Blog', desc: 'Share your thoughts' },
  { id: 'link', emoji: '🔗', label: 'Link Page', desc: 'Like Linktree, but yours' },
]

const COLOR_VIBES = [
  { id: 'sunset', label: 'Sunset', colors: ['#ff6b6b', '#feca57', '#ff9ff3'], emoji: '🌅' },
  { id: 'ocean', label: 'Ocean', colors: ['#0abde3', '#48dbfb', '#c8d6e5'], emoji: '🌊' },
  { id: 'forest', label: 'Forest', colors: ['#2d6a4f', '#52b788', '#d8f3dc'], emoji: '🌿' },
  { id: 'candy', label: 'Candy', colors: ['#e040fb', '#7c4dff', '#ff80ab'], emoji: '🍬' },
  { id: 'midnight', label: 'Midnight', colors: ['#1a1a2e', '#16213e', '#e94560'], emoji: '🌙' },
  { id: 'peach', label: 'Peach', colors: ['#ffb5a7', '#fcd5ce', '#f8edeb'], emoji: '🍑' },
]

const STYLE_VIBES = [
  { id: 'clean', label: 'Clean & Simple', emoji: '✨' },
  { id: 'bold', label: 'Bold & Loud', emoji: '🔥' },
  { id: 'retro', label: 'Retro / Y2K', emoji: '📟' },
  { id: 'cute', label: 'Cute & Soft', emoji: '🧸' },
]

export default function Onboarding({ onComplete, onGoHome, onStepChange }) {
  const [step, setStepRaw] = useState(0)
  const setStep = (v) => {
    const next = typeof v === 'function' ? v(step) : v
    setStepRaw(next)
    if (onStepChange) onStepChange(next)
  }

  const TOTAL_STEPS = 5
  const [projectType, setProjectType] = useState(null)
  const [projectName, setProjectName] = useState('')
  const [colorVibe, setColorVibe] = useState(null)
  const [styleVibe, setStyleVibe] = useState(null)
  const [extras, setExtras] = useState('')

  const steps = [
    { title: 'What are you making?', subtitle: 'Pick a project type to get started' },
    { title: "Give it a name!", subtitle: "What's your project called?" },
    { title: 'Pick your vibe', subtitle: 'Choose a color palette' },
    { title: 'What style?', subtitle: 'How should it feel?' },
    { title: "Almost there!", subtitle: 'Anything else you want?' },
  ]

  const canProceed = () => {
    if (step === 0) return !!projectType
    if (step === 1) return projectName.trim().length > 0
    if (step === 2) return !!colorVibe
    if (step === 3) return !!styleVibe
    return true
  }

  const buildPrompt = () => {
    const type = PROJECT_TYPES.find(t => t.id === projectType)
    const color = COLOR_VIBES.find(c => c.id === colorVibe)
    const style = STYLE_VIBES.find(s => s.id === styleVibe)

    let prompt = `Build a beautiful ${type.label.toLowerCase()} website called "${projectName}".`
    prompt += ` Use a ${color.label.toLowerCase()} color palette (colors: ${color.colors.join(', ')}).`
    prompt += ` The design style should be ${style.label.toLowerCase()}.`
    prompt += ` Include a hero section with the name prominently displayed, `

    if (projectType === 'portfolio') {
      prompt += `a gallery/work grid section, an about me section, and a contact section.`
    } else if (projectType === 'club') {
      prompt += `a section about the club/team, a members or roster section, upcoming events, and a join/contact section.`
    } else if (projectType === 'event') {
      prompt += `event details (date, time, location placeholders), a schedule/agenda, a photo or gallery section, and an RSVP/signup form.`
    } else if (projectType === 'store') {
      prompt += `a featured products grid with placeholder images, product cards with prices, and a simple contact/order section.`
    } else if (projectType === 'blog') {
      prompt += `a featured article hero, an article grid with thumbnails, categories, and a newsletter signup.`
    } else if (projectType === 'link') {
      prompt += `a profile section with avatar placeholder, a vertical list of styled link buttons, and social media icons at the bottom.`
    }

    prompt += ` Make it look really polished and fun. Add smooth animations and hover effects.`
    prompt += ` It should work great on phones too.`

    if (extras.trim()) {
      prompt += ` Additional details: ${extras.trim()}`
    }

    return prompt
  }

  const handleFinish = () => {
    onComplete(buildPrompt(), projectName)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && canProceed()) {
      e.preventDefault()
      if (step < 4) setStep(s => s + 1)
      else handleFinish()
    }
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Scrollable content area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 520,
          padding: '24px 24px 16px',
          marginTop: 'auto',
          marginBottom: 'auto',
        }}>
          {/* Step header */}
          <div key={`header-${step}`} style={{
            textAlign: 'center',
            marginBottom: 28,
            animation: 'fadeInUp 0.35s ease-out',
          }}>
            <h1 style={{
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 6,
              lineHeight: 1.2,
            }}>
              {steps[step].title}
            </h1>
            <p style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}>
              {steps[step].subtitle}
            </p>
          </div>

          {/* Step content */}
          <div key={`content-${step}`} style={{ animation: 'fadeInUp 0.35s ease-out 0.05s both' }}>
            {step === 0 && (
              <div className="onboarding-grid-2" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
              }}>
                {PROJECT_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setProjectType(type.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '16px 18px',
                      borderRadius: 'var(--radius-md)',
                      background: projectType === type.id ? 'var(--accent-lighter)' : 'var(--bg-card)',
                      border: `2px solid ${projectType === type.id ? 'var(--accent)' : 'var(--border-default)'}`,
                      boxShadow: projectType === type.id ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      transform: projectType === type.id ? 'translateY(-2px)' : 'translateY(0)',
                    }}
                  >
                    <span style={{ fontSize: 28, flexShrink: 0 }}>{type.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{type.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 500 }}>{type.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div style={{ padding: '0 10%' }}>
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '2px solid var(--border-default)',
                  padding: 6,
                  boxShadow: 'var(--shadow-md)',
                  transition: 'border-color 0.2s ease',
                }}>
                  <input
                    type="text"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      projectType === 'portfolio' ? "e.g. Sarah's Art Studio" :
                      projectType === 'club' ? 'e.g. Chess Club' :
                      projectType === 'event' ? 'e.g. Summer Bash 2026' :
                      projectType === 'store' ? 'e.g. Handmade by Em' :
                      projectType === 'blog' ? 'e.g. Pixel Thoughts' :
                      'e.g. My Links'
                    }
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '16px 18px',
                      fontSize: 18,
                      fontWeight: 700,
                      borderRadius: 'var(--radius-md)',
                    }}
                  />
                </div>
                <p style={{
                  textAlign: 'center',
                  fontSize: 13,
                  color: 'var(--text-tertiary)',
                  marginTop: 12,
                  fontWeight: 500,
                }}>
                  Don't worry, you can change this later
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="onboarding-grid-3" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
              }}>
                {COLOR_VIBES.map(vibe => (
                  <button
                    key={vibe.id}
                    onClick={() => setColorVibe(vibe.id)}
                    style={{
                      padding: '20px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card)',
                      border: `2px solid ${colorVibe === vibe.id ? 'var(--accent)' : 'var(--border-default)'}`,
                      boxShadow: colorVibe === vibe.id ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      transform: colorVibe === vibe.id ? 'translateY(-2px)' : 'translateY(0)',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 6,
                      marginBottom: 10,
                    }}>
                      {vibe.colors.map((c, i) => (
                        <div key={i} style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: c,
                          border: '2px solid rgba(255,255,255,0.5)',
                          boxShadow: `0 2px 6px ${c}44`,
                        }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{vibe.emoji}</div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{vibe.label}</div>
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="onboarding-grid-2" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                padding: '0 10%',
              }}>
                {STYLE_VIBES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setStyleVibe(style.id)}
                    style={{
                      padding: '22px 18px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card)',
                      border: `2px solid ${styleVibe === style.id ? 'var(--accent)' : 'var(--border-default)'}`,
                      boxShadow: styleVibe === style.id ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      transform: styleVibe === style.id ? 'translateY(-2px)' : 'translateY(0)',
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{style.emoji}</div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{style.label}</div>
                  </button>
                ))}
              </div>
            )}

            {step === 4 && (
              <div style={{ padding: '0 8%' }}>
                {/* Summary pills */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  justifyContent: 'center',
                  marginBottom: 24,
                }}>
                  {[
                    { emoji: PROJECT_TYPES.find(t => t.id === projectType)?.emoji, text: PROJECT_TYPES.find(t => t.id === projectType)?.label },
                    { emoji: '📝', text: projectName },
                    { emoji: COLOR_VIBES.find(c => c.id === colorVibe)?.emoji, text: COLOR_VIBES.find(c => c.id === colorVibe)?.label },
                    { emoji: STYLE_VIBES.find(s => s.id === styleVibe)?.emoji, text: STYLE_VIBES.find(s => s.id === styleVibe)?.label },
                  ].map((pill, i) => (
                    <span key={i} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--accent-lighter)',
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--accent-dark)',
                    }}>
                      {pill.emoji} {pill.text}
                    </span>
                  ))}
                </div>

                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '2px solid var(--border-default)',
                  padding: 6,
                  boxShadow: 'var(--shadow-md)',
                  marginBottom: 12,
                }}>
                  <textarea
                    value={extras}
                    onChange={e => setExtras(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Anything special? e.g. 'Add a dark mode toggle' or 'Include my Instagram feed' or just leave blank!"
                    rows={3}
                    style={{
                      width: '100%',
                      resize: 'none',
                      padding: '14px 16px',
                      fontSize: 15,
                      fontWeight: 500,
                      lineHeight: 1.5,
                      borderRadius: 'var(--radius-md)',
                    }}
                  />
                </div>
                <p style={{
                  textAlign: 'center',
                  fontSize: 13,
                  color: 'var(--text-tertiary)',
                  fontWeight: 500,
                }}>
                  Totally optional — you can always tweak things after
                </p>
              </div>
            )}
          </div>

          {/* Skip link (step 0 only) */}
          {step === 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 20,
            }}>
              <button
                onClick={() => {
                  const prompt = window.prompt('Describe what you want to build:')
                  if (prompt?.trim()) onComplete(prompt.trim())
                }}
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-default)',
                  transition: 'all 0.15s ease',
                }}
              >
                or just type a prompt
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pinned navigation bar */}
      <div style={{
        padding: '16px 24px',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 520,
        width: '100%',
        margin: '0 auto',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '12px 20px',
                borderRadius: 'var(--radius-full)',
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--text-secondary)',
                border: '2px solid var(--border-default)',
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          ) : onGoHome ? (
            <button
              onClick={onGoHome}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--accent)',
                padding: '12px 16px',
                transition: 'all 0.15s ease',
              }}
            >
              <ArrowLeft size={15} />
              Back to projects
            </button>
          ) : <div />}
        </div>

        <button
          onClick={() => {
            if (step < 4) setStep(s => s + 1)
            else handleFinish()
          }}
          disabled={!canProceed()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 28px',
            borderRadius: 'var(--radius-full)',
            fontSize: 15,
            fontWeight: 800,
            background: canProceed()
              ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))'
              : 'var(--border-default)',
            color: canProceed() ? '#fff' : 'var(--text-tertiary)',
            boxShadow: canProceed() ? 'var(--shadow-accent)' : 'none',
            transition: 'all 0.25s ease',
          }}
        >
          {step === 4 ? (
            <>
              Build it! <Rocket size={17} />
            </>
          ) : (
            <>
              Next <ArrowRight size={17} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
