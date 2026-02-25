import React, { useState, useMemo, useEffect } from 'react'
import { Monitor, Smartphone, Code2, Rocket, ExternalLink, Loader2, Check, RotateCw, PartyPopper, KeyRound } from 'lucide-react'

export default function PreviewPanel({ code, isGenerating, onDeploy, isDeploying, deployUrl, claimUrl }) {
  const [viewMode, setViewMode] = useState('preview')
  const [deviceMode, setDeviceMode] = useState('desktop')
  const [iframeKey, setIframeKey] = useState(0)
  const prevCodeRef = React.useRef(code)

  const previewUrl = useMemo(() => {
    if (!code) return null
    const blob = new Blob([code], { type: 'text/html' })
    return URL.createObjectURL(blob)
  }, [code])

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  // Force iframe reload when code changes to avoid stale cache
  useEffect(() => {
    if (code !== prevCodeRef.current) {
      setIframeKey(k => k + 1)
      prevCodeRef.current = code
    }
  }, [code])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-tertiary)',
    }}>
      {/* Toolbar */}
      <div className="preview-toolbar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        borderBottom: '1px solid var(--border-default)',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        gap: 8,
        flexShrink: 0,
      }}>
        {/* View toggle */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-full)',
          padding: 3,
        }}>
          {[
            { key: 'preview', icon: Monitor, label: 'Preview' },
            { key: 'code', icon: Code2, label: 'Code' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
                fontWeight: 700,
                color: viewMode === tab.key ? 'var(--accent-dark)' : 'var(--text-tertiary)',
                background: viewMode === tab.key ? '#fff' : 'transparent',
                boxShadow: viewMode === tab.key ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Device + refresh */}
        {viewMode === 'preview' && (
          <div className="device-controls" style={{ display: 'flex', gap: 3 }}>
            {[
              { key: 'desktop', icon: Monitor, tip: 'Desktop' },
              { key: 'mobile', icon: Smartphone, tip: 'Mobile' },
            ].map(d => (
              <button
                key={d.key}
                onClick={() => setDeviceMode(d.key)}
                title={d.tip}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: deviceMode === d.key ? 'var(--accent)' : 'var(--text-tertiary)',
                  background: deviceMode === d.key ? 'var(--accent-lighter)' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <d.icon size={15} />
              </button>
            ))}
            <button
              onClick={() => setIframeKey(k => k + 1)}
              title="Refresh"
              style={{
                width: 34, height: 34, borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-tertiary)',
              }}
            >
              <RotateCw size={14} />
            </button>
          </div>
        )}

        {/* Deploy */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {deployUrl && (
            <a
              href={deployUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--green)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--green-bg)',
                border: '1.5px solid rgba(45,157,111,0.2)',
              }}
            >
              <PartyPopper size={14} />
              It's live!
              <ExternalLink size={12} />
            </a>
          )}
          {claimUrl && (
            <a
              href={claimUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--accent)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-lighter)',
                border: '1.5px solid rgba(224,122,47,0.2)',
                textDecoration: 'none',
              }}
            >
              <KeyRound size={13} />
              Claim site
            </a>
          )}
          <button
            onClick={onDeploy}
            disabled={!code || isDeploying || isGenerating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: 14,
              fontWeight: 800,
              background: code && !isDeploying
                ? 'linear-gradient(135deg, var(--accent), var(--pink))'
                : 'var(--border-default)',
              color: code && !isDeploying ? '#fff' : 'var(--text-tertiary)',
              boxShadow: code && !isDeploying ? 'var(--shadow-accent)' : 'none',
              transition: 'all 0.25s ease',
            }}
          >
            {isDeploying ? (
              <>
                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                Deploying...
              </>
            ) : (
              <>
                <Rocket size={15} />
                Deploy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: viewMode === 'code' ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
        padding: viewMode === 'preview' && deviceMode === 'mobile' ? 20 : 0,
      }}>
        {!code ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            color: 'var(--text-tertiary)',
          }}>
            {isGenerating ? (
              <>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-lighter), var(--accent-bg))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'float 2s ease-in-out infinite',
                  fontSize: 22,
                }}>
                  ✨
                </div>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Building something awesome...</span>
                <span style={{ fontSize: 13 }}>This usually takes a few seconds</span>
              </>
            ) : (
              <>
                <div style={{ fontSize: 40, animation: 'float 3s ease-in-out infinite' }}>🖼️</div>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Your creation will appear here</span>
              </>
            )}
          </div>
        ) : viewMode === 'preview' ? (
          <div style={{
            width: deviceMode === 'mobile' ? 375 : '100%',
            height: deviceMode === 'mobile' ? '92%' : '100%',
            background: '#fff',
            borderRadius: deviceMode === 'mobile' ? 'var(--radius-xl)' : 0,
            boxShadow: deviceMode === 'mobile' ? 'var(--shadow-float)' : 'none',
            overflow: 'hidden',
            transition: 'all 0.35s ease',
            border: deviceMode === 'mobile' ? '3px solid #1a1a1a' : 'none',
            position: 'relative',
          }}>
            {/* Mobile notch */}
            {deviceMode === 'mobile' && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 120,
                height: 28,
                background: '#1a1a1a',
                borderRadius: '0 0 16px 16px',
                zIndex: 2,
              }} />
            )}
            <iframe
              key={iframeKey}
              src={previewUrl}
              title="Preview"
              sandbox="allow-scripts allow-same-origin"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </div>
        ) : (
          <pre style={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
            padding: 24,
            margin: 0,
            fontSize: 13,
            lineHeight: 1.7,
            fontFamily: 'var(--font-mono)',
            color: '#5c5470',
            tabSize: 2,
          }}>
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  )
}
