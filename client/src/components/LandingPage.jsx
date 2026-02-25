import React, { useEffect, useMemo, useState } from 'react'
import { Plus, ExternalLink, Trash2 } from 'lucide-react'
import { deleteProject } from '../services/projectStorage.js'

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

function ProjectThumbnail({ code }) {
  const blobUrl = useMemo(() => {
    if (!code) return null
    return URL.createObjectURL(new Blob([code], { type: 'text/html' }))
  }, [code])

  useEffect(() => {
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl) }
  }, [blobUrl])

  if (!blobUrl) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-tertiary)',
        fontSize: 14,
        fontWeight: 600,
      }}>
        No preview
      </div>
    )
  }

  return (
    <iframe
      src={blobUrl}
      sandbox="allow-scripts"
      tabIndex={-1}
      style={{
        width: 1120,
        height: 720,
        transform: 'scale(0.25)',
        transformOrigin: 'top left',
        pointerEvents: 'none',
        border: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
  )
}

export default function LandingPage({ projects, onNewProject, onSelectProject, onProjectsChange }) {
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = (e, projectId) => {
    e.stopPropagation()
    if (deletingId === projectId) {
      deleteProject(projectId)
      setDeletingId(null)
      if (onProjectsChange) onProjectsChange()
    } else {
      setDeletingId(projectId)
    }
  }

  return (
    <div style={{
      flex: 1,
      overflow: 'auto',
      padding: '40px 24px 60px',
    }}>
      <div style={{
        maxWidth: 960,
        margin: '0 auto',
      }}>
        {/* Hero */}
        <div style={{
          textAlign: 'center',
          marginBottom: 40,
          animation: 'fadeInUp 0.4s ease-out',
        }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: 8,
            color: 'var(--text-primary)',
          }}>
            Your Projects
          </h1>
          <p style={{
            fontSize: 16,
            color: 'var(--text-secondary)',
            fontWeight: 500,
            marginBottom: 28,
          }}>
            Pick up where you left off, or start something new.
          </p>
          <button
            onClick={onNewProject}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 28px',
              borderRadius: 'var(--radius-full)',
              fontSize: 15,
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              color: '#fff',
              boxShadow: 'var(--shadow-accent)',
              transition: 'all 0.2s ease',
            }}
          >
            <Plus size={18} />
            New Project
          </button>
        </div>

        {/* Project Grid */}
        <div className="landing-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
          animation: 'fadeInUp 0.5s ease-out 0.1s both',
        }}>
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Thumbnail */}
              <div style={{
                width: '100%',
                height: 180,
                overflow: 'hidden',
                position: 'relative',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-secondary)',
              }}>
                <ProjectThumbnail code={project.code} />
              </div>

              {/* Info */}
              <div style={{ padding: '16px 18px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}>
                  <h3 style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}>
                    {project.name}
                  </h3>
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    title={deletingId === project.id ? 'Click again to confirm' : 'Delete project'}
                    style={{
                      padding: 4,
                      borderRadius: 'var(--radius-sm)',
                      color: deletingId === project.id ? '#e53e3e' : 'var(--text-tertiary)',
                      transition: 'color 0.15s ease',
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}>
                  <span style={{
                    fontSize: 13,
                    color: 'var(--text-tertiary)',
                    fontWeight: 500,
                  }}>
                    {timeAgo(project.lastEdited)}
                  </span>

                  {project.deployUrl && (
                    <a
                      href={project.deployUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--green)',
                        background: 'var(--green-bg)',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        textDecoration: 'none',
                      }}
                    >
                      Live <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
