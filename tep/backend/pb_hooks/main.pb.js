// PocketBase JS Hooks — pb_hooks/main.pb.js
// Se ejecutan en el servidor de PocketBase automáticamente

// ── AUTO WORD COUNT al guardar sección ───────────────────────
onRecordBeforeUpdateRequest((e) => {
  const record = e.record
  if (!record) return

  const content = record.get("content")
  if (!content) return

  // Extraer texto del JSON Tiptap y contar palabras
  function extractText(node) {
    let text = ""
    if (node.text) text += node.text + " "
    if (node.content) node.content.forEach(n => { text += extractText(n) })
    return text
  }

  try {
    const doc = typeof content === "string" ? JSON.parse(content) : content
    const text = extractText(doc).trim()
    const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0
    record.set("word_count", wordCount)
  } catch (_) {
    // Si el JSON es inválido, no bloquear el guardado
  }
}, "sections")

// ── AUTO SNAPSHOT cada 30 minutos por proyecto ───────────────
// (versión simplificada — en producción puedes usar un cron job)
onRecordAfterUpdateRequest((e) => {
  const section = e.record
  if (!section) return

  const projectId = section.get("project")
  if (!projectId) return

  try {
    // Verificar si hay una versión auto reciente (últimos 30 min)
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    const recent = $app.dao().findRecordsByFilter(
      "versions",
      `project = '${projectId}' && auto = true && created >= '${thirtyMinAgo}'`,
      "-created",
      1,
      0
    )

    if (recent.length > 0) return // Ya hay snapshot reciente

    // Obtener todas las secciones del proyecto
    const sections = $app.dao().findRecordsByFilter(
      "sections",
      `project = '${projectId}'`,
      "order_index",
      500,
      0
    )

    const snapshot = {}
    sections.forEach(s => {
      snapshot[s.id] = s.get("content")
    })

    // Crear versión automática
    const versionsCol = $app.dao().findCollectionByNameOrId("versions")
    const versionRecord = new Record(versionsCol, {
      project:  projectId,
      label:    `Auto ${new Date().toLocaleString("es-ES")}`,
      snapshot: snapshot,
      auto:     true,
    })
    $app.dao().saveRecord(versionRecord)

    // Limpiar versiones auto antiguas (conservar últimas 10)
    const oldVersions = $app.dao().findRecordsByFilter(
      "versions",
      `project = '${projectId}' && auto = true`,
      "-created",
      100,
      10  // skip first 10 (the most recent)
    )
    oldVersions.forEach(v => {
      try { $app.dao().deleteRecord(v) } catch (_) {}
    })

  } catch (err) {
    // No bloquear el guardado si el snapshot falla
    console.error("Auto-snapshot error:", err)
  }
}, "sections")

// ── ACTUALIZAR word_count del proyecto al guardar sección ─────
onRecordAfterUpdateRequest((e) => {
  const section = e.record
  if (!section) return

  const projectId = section.get("project")
  if (!projectId) return

  try {
    // Sumar palabras de todas las secciones
    const sections = $app.dao().findRecordsByFilter(
      "sections",
      `project = '${projectId}'`,
      "",
      500,
      0
    )

    let total = 0
    sections.forEach(s => { total += (s.get("word_count") || 0) })

    // Actualizar proyecto
    const project = $app.dao().findRecordById("projects", projectId)
    project.set("word_count", total)
    $app.dao().saveRecord(project)
  } catch (_) {}
}, "sections")
