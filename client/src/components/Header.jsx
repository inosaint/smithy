import React from 'react'
import { Anvil, Sparkles, Eye, EyeOff } from 'lucide-react'

export default function Header({ screen, showPreview, onTogglePreview, onNewProject, onGoHome, hasCode, projectName, onboardingStep, onboardingTotalSteps }) {
  return (
    <header style={{
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      borderBottom: '1px solid var(--border-default)',
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      flexShrink: 0,
      zIndex: 100,
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <button
          onClick={onGoHome}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-accent)',
            flexShrink: 0,
          }}>
            <Anvil size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="header-brand-text" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Smithy
            <Sparkles size={14} style={{ color: 'var(--accent)', WebkitTextFillColor: 'initial' }} />
          </span>
        </button>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--accent-dark)',
          background: 'var(--accent-lighter)',
          padding: '3px 9px',
          borderRadius: 'var(--radius-full)',
          letterSpacing: '0.03em',
          flexShrink: 0,
        }}>
          BETA
        </span>
        {screen === 'building' && projectName && (
          <>
            <span className="header-project-name" style={{ color: 'var(--border-strong)', fontSize: 14, flexShrink: 0 }}>/</span>
            <span className="header-project-name" style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {projectName}
            </span>
          </>
        )}
      </div>

      {screen === 'onboarding' && onboardingStep != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 120,
            height: 6,
            background: 'var(--border-default)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${(onboardingStep / onboardingTotalSteps) * 100}%`,
              background: 'linear-gradient(90deg, var(--accent), var(--accent-dark))',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.4s ease',
            }} />
          </div>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text-tertiary)',
          }}>
            {onboardingStep} / {onboardingTotalSteps}
          </span>
        </div>
      )}

      {screen === 'building' && (
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {hasCode && (
            <button
              onClick={onTogglePreview}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
                fontWeight: 700,
                color: showPreview ? 'var(--accent)' : 'var(--text-secondary)',
                background: showPreview ? 'var(--accent-lighter)' : 'transparent',
                border: `2px solid ${showPreview ? 'var(--accent-light)' : 'var(--border-default)'}`,
                transition: 'all 0.2s ease',
              }}
            >
              {showPreview ? <Eye size={15} /> : <EyeOff size={15} />}
              <span className="preview-toggle-label">
                {showPreview ? 'Hide preview' : 'View preview'}
              </span>
            </button>
          )}
        </div>
      )}
    </header>
  )
}
