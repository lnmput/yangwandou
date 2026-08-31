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
    const item = { file, element, status: 'pending', previewUrl: URL.createObjectURL(file) }
    element.querySelector('.upload-preview img').src = item.previewUrl
    element.querySelector('.upload-filename').textContent = `${file.name} · ${formatSize(file.size)}`
    element.querySelector('.upload-remove').addEventListener('click', () => {
      if (uploading) return
      URL.revokeObjectURL(item.previewUrl)
      const index = items.indexOf(item)
      if (index >= 0) items.splice(index, 1)
      element.remove()
      updateSummary()
    })
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

  const optimizeImage = async (file) => {
    const needsFormatConversion = !uploadTypes.has(file.type)
    if (!needsFormatConversion && (!optimizeToggle.checked || file.size < optimizeAboveBytes || file.type === 'image/gif' || file.type === 'image/avif')) return file
    let bitmap
    try {
      bitmap = await createImageBitmap(file)
    } catch {
      throw new Error('当前浏览器无法读取这张照片，请在相机设置中选择“兼容性最佳”后重试。')
    }
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    if (!needsFormatConversion && scale === 1 && file.type === 'image/jpeg' && file.size < 5 * 1024 * 1024) {
      bitmap.close()
      return file
    }
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise((resolve, reject) => canvas.toBlob(
      (value) => value ? resolve(value) : reject(new Error('图片压缩失败。')),
      'image/jpeg',
      0.86,
    ))
    if (blob.size >= file.size) return file
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
        const optimized = await optimizeImage(item.file)
        setState(item, optimized === item.file ? '正在上传…' : `已优化为 ${formatSize(optimized.size)} · 上传中…`)
        const result = await send(item, optimized)
        item.status = 'done'
        item.result = result
        setProgress(item, 100)
        setState(item, `已上传 · № ${result.no}`, 'success')
        item.element.classList.add('is-complete')
        item.element.querySelectorAll('input, .upload-remove').forEach((control) => { control.disabled = true })
      } catch (error) {
        item.status = 'error'
        setProgress(item, 0)
        setState(item, '上传失败', 'error')
        setError(item, error instanceof Error ? error.message : '上传失败，请稍后重试。')
      }
    }
    uploading = false
    updateSummary()
  })

  window.addEventListener('beforeunload', () => items.forEach((item) => URL.revokeObjectURL(item.previewUrl)))
  updateSummary()
})()
