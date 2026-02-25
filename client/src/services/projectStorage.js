const STORAGE_KEY = 'appforge_projects'

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

function writeAll(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function listProjects() {
  return Object.values(readAll()).sort((a, b) => b.lastEdited - a.lastEdited)
}

export function getProject(id) {
  return readAll()[id] || null
}

export function saveProject(project) {
  const projects = readAll()
  projects[project.id] = { ...project, lastEdited: Date.now() }
  writeAll(projects)
}

export function deleteProject(id) {
  const projects = readAll()
  delete projects[id]
  writeAll(projects)
}

export function hasProjects() {
  return listProjects().length > 0
}
