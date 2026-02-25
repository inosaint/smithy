import { Router } from 'express'
import { getProject, saveProject } from '../services/projectStore.js'

const router = Router()
export { router as deployRoute }

const HERE_NOW_API = 'https://here.now/api/v1'

router.post('/', async (req, res) => {
  const { projectId, code } = req.body

  if (!code) {
    return res.status(400).json({ error: 'No code to deploy' })
  }

  try {
    const project = projectId ? getProject(projectId) : null
    const htmlBuffer = Buffer.from(code, 'utf-8')

    let slug, siteUrl, claimToken, claimUrl, expiresAt, versionId

    if (project?.hereNowSlug) {
      // Update existing publish
      console.log('[deploy] Updating existing slug:', project.hereNowSlug)
      const updateRes = await fetch(`${HERE_NOW_API}/publish/${project.hereNowSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: [{ path: 'index.html', size: htmlBuffer.length, contentType: 'text/html; charset=utf-8' }],
          ...(project.claimToken ? { claimToken: project.claimToken } : {}),
        }),
      })

      if (!updateRes.ok) {
        const err = await updateRes.text()
        console.error('[deploy] here.now update failed:', updateRes.status, err)
        throw new Error('Deploy update failed')
      }

      const updateData = await updateRes.json()
      console.log('[deploy] Update response:', JSON.stringify(updateData, null, 2))

      slug = project.hereNowSlug
      siteUrl = updateData.siteUrl || `https://${slug}.here.now`
      versionId = updateData.upload?.versionId
      claimToken = project.claimToken
      claimUrl = project.claimUrl

      // Upload the file using headers from the response
      const uploadInfo = updateData.upload?.uploads?.[0]
      if (uploadInfo?.url) {
        console.log('[deploy] Uploading HTML (%d bytes) to presigned URL...', htmlBuffer.length)
        const uploadRes = await fetch(uploadInfo.url, {
          method: uploadInfo.method || 'PUT',
          headers: uploadInfo.headers || { 'Content-Type': 'text/html; charset=utf-8' },
          body: htmlBuffer,
        })
        console.log('[deploy] Upload response:', uploadRes.status, uploadRes.statusText)
        if (!uploadRes.ok) {
          const err = await uploadRes.text()
          console.error('[deploy] Upload failed:', err)
          throw new Error('File upload failed')
        }
      } else {
        console.error('[deploy] No upload URL in response!')
        throw new Error('No upload URL returned from here.now')
      }

      // Finalize
      if (versionId) {
        console.log('[deploy] Finalizing version:', versionId)
        const finalizeRes = await fetch(`${HERE_NOW_API}/publish/${slug}/finalize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ versionId }),
        })
        const finalizeData = await finalizeRes.json()
        console.log('[deploy] Finalize response:', JSON.stringify(finalizeData, null, 2))
        if (!finalizeRes.ok) {
          throw new Error('Finalize failed')
        }
      } else {
        console.error('[deploy] No versionId — cannot finalize!')
        throw new Error('No versionId returned from here.now')
      }
    } else {
      // Create new publish (anonymous)
      console.log('[deploy] Creating new anonymous publish, file size:', htmlBuffer.length)
      const createRes = await fetch(`${HERE_NOW_API}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: [{ path: 'index.html', size: htmlBuffer.length, contentType: 'text/html; charset=utf-8' }],
        }),
      })

      if (!createRes.ok) {
        const err = await createRes.text()
        console.error('[deploy] here.now create failed:', createRes.status, err)
        throw new Error('Deploy failed')
      }

      const createData = await createRes.json()
      console.log('[deploy] Create response:', JSON.stringify(createData, null, 2))

      slug = createData.slug
      siteUrl = createData.siteUrl
      claimToken = createData.claimToken
      claimUrl = createData.claimUrl
      expiresAt = createData.expiresAt
      versionId = createData.upload?.versionId

      // Upload the file using headers from the response
      const uploadInfo = createData.upload?.uploads?.[0]
      if (uploadInfo?.url) {
        console.log('[deploy] Uploading HTML (%d bytes) to presigned URL...', htmlBuffer.length)
        const uploadRes = await fetch(uploadInfo.url, {
          method: uploadInfo.method || 'PUT',
          headers: uploadInfo.headers || { 'Content-Type': 'text/html; charset=utf-8' },
          body: htmlBuffer,
        })
        console.log('[deploy] Upload response:', uploadRes.status, uploadRes.statusText)
        if (!uploadRes.ok) {
          const err = await uploadRes.text()
          console.error('[deploy] Upload failed:', err)
          throw new Error('File upload failed')
        }
      } else {
        console.error('[deploy] No upload URL in response!')
        throw new Error('No upload URL returned from here.now')
      }

      // Finalize
      if (versionId) {
        console.log('[deploy] Finalizing version:', versionId)
        const finalizeRes = await fetch(`${HERE_NOW_API}/publish/${slug}/finalize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ versionId }),
        })
        const finalizeData = await finalizeRes.json()
        console.log('[deploy] Finalize response:', JSON.stringify(finalizeData, null, 2))
        if (!finalizeRes.ok) {
          throw new Error('Finalize failed')
        }
      } else {
        console.error('[deploy] No versionId — cannot finalize!')
        throw new Error('No versionId returned from here.now')
      }
    }

    // Update project record
    if (project) {
      project.deployUrl = siteUrl
      project.hereNowSlug = slug
      project.claimToken = claimToken
      project.claimUrl = claimUrl
      project.lastDeployed = Date.now()
      saveProject(project)
    }

    res.json({
      success: true,
      url: siteUrl,
      claimUrl: claimUrl || null,
      expiresAt: expiresAt || null,
      deployedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Deploy error:', err)
    res.status(500).json({ error: 'Deployment failed. Please try again.' })
  }
})
