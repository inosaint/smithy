// Simple in-memory project store for MVP
// In production, replace with a database (Redis, Postgres, etc.)

const projects = new Map()

export function getProject(id) {
  return projects.get(id) || null
}

export function saveProject(project) {
  projects.set(project.id, project)
}

export function deleteProject(id) {
  projects.delete(id)
}

export function listProjects() {
  return Array.from(projects.values())
}
