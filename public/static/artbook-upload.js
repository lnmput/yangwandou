(() => {
  const picker = document.querySelector('#artwork-files')
  const optimizeToggle = document.querySelector('#optimize-images')
  const list = document.querySelector('#upload-list')
  const summary = document.querySelector('#upload-summary')
  const submit = document.querySelector('#upload-submit')
  const template = document.querySelector('#upload-item-template')

  if (!picker || !optimizeToggle || !list || !summary || !submit || !template) return

  const uploadTypes = new Set(['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'])
  const allowedTypes = new Set([...uploadTypes, 'image/heic', 'image/heif'])
  const maxBytes = 30 * 1024 * 1024
  const optimizeAboveBytes = 2 * 1024 * 1024
  const maxDimension = 2560
  const items = []
  let uploading = false

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const setProgress = (item, percent) => {
    item.element.querySelector('.upload-progress i').style.width = `${Math.max(0, Math.min(100, percent))}%`
  }

  const setState = (item, text, kind = '') => {
    const state = item.element.querySelector('.upload-state')
    state.textContent = text
    state.dataset.kind = kind
  }

  const setError = (item, message = '') => {
    item.element.querySelector('.upload-error').textContent = message
  }

  const updateSummary = () => {
    const completed = items.filter((item) => item.status === 'done').length
    const failed = items.filter((item) => item.status === 'error').length
    const pending = items.length - completed

    if (!items.length) summary.textContent = '尚未选择照片'
    else if (uploading) summary.textContent = `正在上传 ${completed + 1} / ${items.length}`
    else if (!pending) summary.textContent = `${completed} 张照片已加入画册`
    else if (failed) summary.textContent = `${failed} 张上传失败，可修改后重试`
    else summary.textContent = `已选择 ${items.length} 张照片 · 共 ${formatSize(items.reduce((sum, item) => sum + item.file.size, 0))}`

    submit.disabled = uploading || !items.some((item) => item.status !== 'done')
    submit.innerHTML = uploading ? '正在上传…' : (failed ? '重试失败项目 <span>→</span>' : '上传到画册 <span>→</span>')
    picker.disabled = uploading
    optimizeToggle.disabled = uploading
  }

  const validateMetadata = (item) => {
    const title = item.element.querySelector('.upload-title').value.trim()
    const date = item.element.querySelector('.upload-date').value
    const age = item.element.querySelector('.upload-age').value.trim()
    if (title && (!date || !age)) return '填写标题时，也需要填写创作月份和年龄。'
    return ''
  }

  const addFile = (file) => {
    if (!allowedTypes.has(file.type)) return { error: `${file.name}：不支持这种图片格式。` }
    if (!file.size || file.size > maxBytes) return { error: `${file.name}：图片必须小于 30MB。` }

    const element = template.content.firstElementChild.cloneNode(true)
    const item = { file, element, status: 'pending', rotation: 0, previewUrl: URL.createObjectURL(file) }
    const preview = element.querySelector('.upload-preview img')
    preview.src = item.previewUrl
    element.querySelector('.upload-filename').textContent = `${file.name} · ${formatSize(file.size)}`
    element.querySelector('.upload-remove').addEventListener('click', () => {
      if (uploading) return
      URL.revokeObjectURL(item.previewUrl)
      const index = items.indexOf(item)
      if (index >= 0) items.splice(index, 1)
      element.remove()
      updateSummary()
    })
    element.querySelectorAll('.upload-rotate button').forEach((button) => button.addEventListener('click', () => {
      if (uploading) return
      item.rotation = (item.rotation + (button.classList.contains('rotate-left') ? -90 : 90) + 360) % 360
      preview.style.transform = `rotate(${item.rotation}deg)`
      if (item.status === 'error') {
        item.status = 'pending'
        setState(item, '等待上传')
        setError(item)
        updateSummary()
      }
    }))
    element.querySelectorAll('input').forEach((input) => input.addEventListener('input', () => {
      if (item.status === 'error') {
        item.status = 'pending'
        setState(item, '等待上传')
        setError(item)
        setProgress(item, 0)
        updateSummary()
      }
    }))
    items.push(item)
    list.append(element)
    return { item }
  }

  picker.addEventListener('change', () => {
    const errors = []
    for (const file of picker.files) {
      const result = addFile(file)
      if (result.error) errors.push(result.error)
    }
    picker.value = ''
    updateSummary()
    if (errors.length) window.alert(errors.join('\n'))
  })

  const optimizeImage = async (item) => {
    const { file, rotation } = item
    const needsFormatConversion = !uploadTypes.has(file.type)
    if (!rotation && !needsFormatConversion && (!optimizeToggle.checked || file.size < optimizeAboveBytes || file.type === 'image/gif' || file.type === 'image/avif')) return file
    let bitmap
    try {
      bitmap = await createImageBitmap(file)
    } catch {
      throw new Error('当前浏览器无法读取这张照片，请在相机设置中选择“兼容性最佳”后重试。')
    }
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    if (!rotation && !needsFormatConversion && scale === 1 && file.type === 'image/jpeg' && file.size < 5 * 1024 * 1024) {
      bitmap.close()
      return file
    }
    const canvas = document.createElement('canvas')
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const swapsSides = rotation === 90 || rotation === 270
    canvas.width = swapsSides ? height : width
    canvas.height = swapsSides ? width : height
    const context = canvas.getContext('2d')
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.translate(canvas.width / 2, canvas.height / 2)
    context.rotate(rotation * Math.PI / 180)
    context.drawImage(bitmap, -width / 2, -height / 2, width, height)
    bitmap.close()
    const blob = await new Promise((resolve, reject) => canvas.toBlob(
      (value) => value ? resolve(value) : reject(new Error('图片压缩失败。')),
      'image/jpeg',
      0.86,
    ))
    if (!rotation && blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' })
  }

  const send = (item, file) => new Promise((resolve, reject) => {
    const form = new FormData()
    const title = item.element.querySelector('.upload-title').value.trim()
    const date = item.element.querySelector('.upload-date').value
    const age = item.element.querySelector('.upload-age').value.trim()
    form.append('file', file)
    form.append('title', title)
    form.append('date', date)
    form.append('age', age)

    const request = new XMLHttpRequest()
    request.open('POST', '/artbook/upload/api/images')
    request.responseType = 'json'
    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) setProgress(item, 10 + (event.loaded / event.total) * 80)
    })
    request.addEventListener('load', () => {
      if (request.status >= 200 && request.status < 300 && request.response?.ok) resolve(request.response)
      else reject(new Error(request.response?.error || `上传失败（HTTP ${request.status}）`))
    })
    request.addEventListener('error', () => reject(new Error('网络连接失败，请稍后重试。')))
    request.addEventListener('timeout', () => reject(new Error('上传超时，请稍后重试。')))
    request.timeout = 120000
    request.send(form)
  })

  submit.addEventListener('click', async () => {
    if (uploading) return
    let hasValidationError = false
    for (const item of items.filter((entry) => entry.status !== 'done')) {
      const error = validateMetadata(item)
      setError(item, error)
      if (error) {
        item.status = 'error'
        setState(item, '请补充信息', 'error')
        hasValidationError = true
      }
    }
    if (hasValidationError) {
      updateSummary()
      list.querySelector('.upload-error:not(:empty)')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    uploading = true
    updateSummary()
    for (const item of items.filter((entry) => entry.status !== 'done')) {
      item.status = 'uploading'
      setError(item)
      setState(item, '准备图片…')
      setProgress(item, 5)
      updateSummary()
      try {
        const optimized = await optimizeImage(item)
        setState(item, optimized === item.file ? '正在上传…' : `已优化为 ${formatSize(optimized.size)} · 上传中…`)
        const result = await send(item, optimized)
        item.status = 'done'
        item.result = result
        setProgress(item, 100)
        setState(item, `已上传 · № ${result.no}`, 'success')
        item.element.classList.add('is-complete')
        item.element.querySelectorAll('input, button').forEach((control) => { control.disabled = true })
      } catch (error) {
        item.status = 'error'
        setProgress(item, 0)
        setState(item, '上传失败', 'error')
        setError(item, error instanceof Error ? error.message : '上传失败，请稍后重试。')
      }
    }
    uploading = false
    updateSummary()
    await loadOrder(true)
  })

  window.addEventListener('beforeunload', () => items.forEach((item) => URL.revokeObjectURL(item.previewUrl)))
  updateSummary()

  const orderGrid = document.querySelector('#order-grid')
  const orderSave = document.querySelector('#order-save')
  const orderMessage = document.querySelector('#order-message')
  let orderedArtworks = []
  let savedKeys = []
  let draggedKey = null

  const updateOrderState = () => {
    orderSave.disabled = orderedArtworks.map((art) => art.key).join('\n') === savedKeys.join('\n')
    if (!orderSave.disabled) orderMessage.textContent = '顺序尚未保存'
  }
  const renderOrder = () => {
    orderGrid.replaceChildren()
    if (!orderedArtworks.length) {
      const empty = document.createElement('p')
      empty.className = 'order-empty'
      empty.textContent = '画册里还没有作品。上传照片后，就会出现在这里。'
      orderGrid.append(empty)
      return
    }
    orderedArtworks.forEach((art, index) => {
      const card = document.createElement('article')
      card.className = 'order-card'
      card.draggable = true
      card.dataset.key = art.key
      const frame = document.createElement('div')
      frame.className = 'order-photo-frame'
      const img = document.createElement('img')
      img.src = art.url
      img.alt = art.title
      img.loading = 'lazy'
      frame.append(img)
      const title = document.createElement('h3')
      title.textContent = art.title
      const meta = document.createElement('p')
      meta.textContent = `№ ${String(index + 1).padStart(2, '0')}${art.date ? ` · ${art.date}` : ''}`
      const controls = document.createElement('div')
      controls.className = 'order-controls'
      const moveTo = (target, focusLabel) => {
        orderedArtworks.splice(index, 1)
        orderedArtworks.splice(target, 0, art)
        renderOrder()
        const movedCard = [...orderGrid.querySelectorAll('.order-card')].find((entry) => entry.dataset.key === art.key)
        movedCard?.querySelector(`[data-action="${focusLabel}"]`)?.focus()
      }
      let lastButton
      for (const [label, target, symbol, action] of [
        ['移到最前', 0, '⇤', 'first'],
        ['移到最后', orderedArtworks.length - 1, '⇥', 'last'],
      ]) {
        const button = document.createElement('button')
        button.type = 'button'
        button.textContent = symbol
        button.title = label
        button.dataset.action = action
        button.setAttribute('aria-label', `${art.title}${label}`)
        button.disabled = index === target
        button.addEventListener('click', () => moveTo(target, action))
        if (action === 'last') lastButton = button
        else controls.append(button)
      }
      for (const [label, delta, symbol] of [['向前移动', -1, '←'], ['向后移动', 1, '→']]) {
        const button = document.createElement('button')
        button.type = 'button'
        button.textContent = symbol
        button.setAttribute('aria-label', `${art.title}${label}`)
        button.disabled = index + delta < 0 || index + delta >= orderedArtworks.length
        button.addEventListener('click', () => {
          moveTo(index + delta, delta < 0 ? 'previous' : 'next')
        })
        button.dataset.action = delta < 0 ? 'previous' : 'next'
        controls.append(button)
      }
      controls.append(lastButton)
      card.append(frame, title, meta, controls)
      card.addEventListener('dragstart', (event) => { draggedKey = art.key; event.dataTransfer.effectAllowed = 'move'; card.classList.add('is-dragging') })
      card.addEventListener('dragend', () => { draggedKey = null; card.classList.remove('is-dragging') })
      card.addEventListener('dragover', (event) => { event.preventDefault(); card.classList.add('is-drop-target') })
      card.addEventListener('dragleave', () => card.classList.remove('is-drop-target'))
      card.addEventListener('drop', (event) => {
        event.preventDefault()
        card.classList.remove('is-drop-target')
        if (!draggedKey || draggedKey === art.key) return
        const from = orderedArtworks.findIndex((entry) => entry.key === draggedKey)
        const to = orderedArtworks.findIndex((entry) => entry.key === art.key)
        orderedArtworks.splice(to, 0, orderedArtworks.splice(from, 1)[0])
        renderOrder()
      })
      orderGrid.append(card)
    })
    updateOrderState()
  }
  const loadOrder = async (preserveChanges = false) => {
    try {
      const response = await fetch('/artbook/upload/api/order')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '读取画作失败。')
      const previous = preserveChanges && !orderSave.disabled ? orderedArtworks : []
      const fresh = new Map(data.artworks.map((art) => [art.key, art]))
      orderedArtworks = previous.length
        ? [...previous.filter((art) => fresh.has(art.key)).map((art) => fresh.get(art.key)), ...data.artworks.filter((art) => !previous.some((old) => old.key === art.key))]
        : data.artworks
      savedKeys = data.artworks.map((art) => art.key)
      orderMessage.textContent = ''
      renderOrder()
    } catch (error) {
      orderGrid.textContent = error.message || '读取画作失败。'
    }
  }
  orderSave.addEventListener('click', async () => {
    orderSave.disabled = true
    orderMessage.textContent = '正在保存…'
    try {
      const response = await fetch('/artbook/upload/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keys: orderedArtworks.map((art) => art.key) }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '保存失败。')
      savedKeys = orderedArtworks.map((art) => art.key)
      orderMessage.textContent = '顺序已保存，刷新画册即可查看'
    } catch (error) {
      orderMessage.textContent = error.message || '保存失败，请重试。'
      updateOrderState()
    }
  })
  loadOrder()
})()
