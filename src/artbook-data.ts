export const ARTBOOK_PREFIX = 'artbook/'

const imageExtension = /\.(avif|gif|jpe?g|png|webp)$/i
const tones = ['sky', 'sun', 'rain', 'lilac', 'night', 'green']

export type Artwork = {
  no: string
  date: string
  age: string
  title: string
  src: string
  tone: string
  showCaption: boolean
}

export type ArtbookData = {
  title: string
  years: string
  description: string
  coverSrc: string
  artworks: Artwork[]
}

type R2HttpMetadata = {
  contentType?: string
  cacheControl?: string
}

export type R2ObjectInfo = {
  key: string
  httpEtag: string
  httpMetadata?: R2HttpMetadata
  customMetadata?: Record<string, string>
  body?: ReadableStream<Uint8Array>
  text?: () => Promise<string>
}

export type R2BucketBinding = {
  get: (key: string) => Promise<R2ObjectInfo | null>
  put: (key: string, value: ReadableStream<Uint8Array> | ArrayBuffer | string | Blob, options?: {
    httpMetadata?: R2HttpMetadata
    customMetadata?: Record<string, string>
  }) => Promise<R2ObjectInfo>
  list: (options?: {
    prefix?: string
    cursor?: string
    include?: Array<'httpMetadata' | 'customMetadata'>
  }) => Promise<{
    objects: R2ObjectInfo[]
    truncated: boolean
    cursor?: string
  }>
}

type ManifestArtwork = {
  file: string
  title?: string
  date?: string
  age?: string
}

type ArtbookManifest = {
  title?: string
  years?: string
  description?: string
  cover?: string
  artworks?: ManifestArtwork[]
}

export type CloudflareBindings = {
  ARTBOOK_BUCKET?: R2BucketBinding
  UPLOAD_PASSWORD?: string
}

const fallbackArtbook: ArtbookData = {
  title: '杨豌豆的画册',
  years: '2018',
  description: '这里收藏了我画的每一幅画',
  coverSrc: '/static/artbook/cover-pea-sprout.png',
  artworks: [
    { no: '01', date: '2020.03', age: '2岁', title: '春天的第一颗种子', src: '/static/artbook/01.png', tone: 'sky', showCaption: true },
  ],
}

const toObjectKey = (file: string) => file.startsWith(ARTBOOK_PREFIX) ? file : `${ARTBOOK_PREFIX}${file}`

const decodeObjectKey = (key: string) => {
  try {
    return decodeURIComponent(key)
  } catch {
    return key
  }
}

export const toMediaUrl = (key: string) => {
  const relativeKey = key.startsWith(ARTBOOK_PREFIX) ? key.slice(ARTBOOK_PREFIX.length) : key
  return `/artbook/media/${relativeKey.split('/').map(encodeURIComponent).join('/')}`
}

const titleFromFilename = (key: string) => {
  const decodedKey = decodeObjectKey(key)
  const filename = decodedKey.split('/').pop() ?? decodedKey
  const stem = filename.replace(/\.[^.]+$/, '')
  const withoutOrder = stem.replace(/^\d+[._ -]*/, '')
  return withoutOrder.replace(/[_-]+/g, ' ').trim() || '未命名画作'
}

const metadataFromFilename = (key: string) => {
  const decodedKey = decodeObjectKey(key)
  const filename = decodedKey.split('/').pop() ?? decodedKey
  const stem = filename.replace(/\.[^.]+$/, '')
  const parts = stem.split('__')

  if (parts.length >= 4 && /^\d+$/.test(parts[0])) {
    return {
      formatted: true,
      date: parts[1],
      age: parts[2],
      title: parts.slice(3).join(' '),
    }
  }

  return { formatted: false, date: '', age: '', title: titleFromFilename(key) }
}

const readManifest = async (bucket: R2BucketBinding): Promise<ArtbookManifest> => {
  try {
    const object = await bucket.get(`${ARTBOOK_PREFIX}manifest.json`)
    if (!object?.text) return {}
    return JSON.parse(await object.text()) as ArtbookManifest
  } catch {
    return {}
  }
}

const listImages = async (bucket: R2BucketBinding) => {
  const objects: R2ObjectInfo[] = []
  let cursor: string | undefined

  do {
    const page = await bucket.list({
      prefix: ARTBOOK_PREFIX,
      cursor,
      include: ['httpMetadata', 'customMetadata'],
    })
    objects.push(...page.objects.filter((object) => imageExtension.test(object.key)))
    cursor = page.truncated ? page.cursor : undefined
  } while (cursor)

  return objects.sort((a, b) => a.key.localeCompare(b.key, 'zh-CN', { numeric: true }))
}

export const getNextArtworkNumber = async (bucket: R2BucketBinding) => {
  const images = await listImages(bucket)
  const highest = images.reduce((max, object) => {
    const filename = decodeObjectKey(object.key).split('/').pop() ?? ''
    const match = filename.match(/^(\d+)/)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)
  return highest + 1
}

export const loadArtbook = async (bucket?: R2BucketBinding): Promise<ArtbookData> => {
  if (!bucket) return fallbackArtbook

  let manifest: ArtbookManifest
  let images: R2ObjectInfo[]

  try {
    [manifest, images] = await Promise.all([readManifest(bucket), listImages(bucket)])
  } catch {
    return fallbackArtbook
  }
  const imageMap = new Map(images.flatMap((object) => [
    [object.key, object] as const,
    [decodeObjectKey(object.key), object] as const,
  ]))
  const manifestCoverKey = manifest.cover ? toObjectKey(manifest.cover) : undefined
  const cover = (manifestCoverKey && imageMap.get(manifestCoverKey))
    || images.find((object) => object.customMetadata?.role === 'cover')
    || images.find((object) => /^cover(?:[._-]|$)/i.test(object.key.split('/').pop() ?? ''))

  const orderedImages = manifest.artworks?.length
    ? manifest.artworks
      .map((item) => ({ item, object: imageMap.get(toObjectKey(item.file)) }))
      .filter((entry): entry is { item: ManifestArtwork, object: R2ObjectInfo } => Boolean(entry.object))
    : images
      .filter((object) => object.key !== cover?.key)
      .map((object) => ({ item: undefined, object }))

  const artworks = orderedImages.map(({ item, object }, index) => {
    const filenameMetadata = metadataFromFilename(object.key)
    const metadata = object.customMetadata ?? {}
    const no = String(index + 1).padStart(2, '0')

    return {
      no,
      date: filenameMetadata.formatted ? (item?.date ?? metadata.date ?? filenameMetadata.date) : '',
      age: filenameMetadata.formatted ? (item?.age ?? metadata.age ?? filenameMetadata.age) : '',
      title: filenameMetadata.formatted ? (item?.title ?? metadata.title ?? filenameMetadata.title) : `画作 ${no}`,
      src: toMediaUrl(object.key),
      tone: tones[index % tones.length],
      showCaption: filenameMetadata.formatted,
    }
  })

  return {
    title: manifest.title ?? fallbackArtbook.title,
    years: manifest.years ?? fallbackArtbook.years,
    description: manifest.description ?? fallbackArtbook.description,
    coverSrc: cover ? toMediaUrl(cover.key) : fallbackArtbook.coverSrc,
    artworks,
  }
}
