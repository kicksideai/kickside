import { computed, ref, type Ref } from 'vue'
import { api } from '@wippy-fe/proxy'
import type { ArtifactState, PreviewSource, Upload, UploadArtifact } from './uploads.types.ts'
import {
  artifactLabel,
  canPreview,
  isPrimaryMarkdown,
  isRawRenderable,
} from './uploads.format.ts'

const PARTS_PER_PAGE = 30

export function useUploadArtifacts(error: Ref<string>) {
  // Preview opens as a right-side overlay drawer; artifactView selects which file
  // the viewer shows (the original, or one extracted part).
  const preview = ref<Upload | null>(null)
  const artifactView = ref<UploadArtifact | null>(null)
  const artifactsByUpload = ref<Record<string, ArtifactState>>({})
  const partsExpanded = ref(false)
  const busyAction = ref(false)

  function artifactStateFor(uploadId: string): ArtifactState {
    return artifactsByUpload.value[uploadId] || {
      loaded: false,
      loading: false,
      error: '',
      primary: null,
      parts: [],
      total: 0,
      page: 1,
    }
  }

  function setArtifactState(uploadId: string, state: ArtifactState) {
    artifactsByUpload.value = { ...artifactsByUpload.value, [uploadId]: state }
  }

  function isSourceArtifact(artifact: UploadArtifact): boolean {
    return artifact.role === 'source' || artifact.locator?.type === 'upload.original'
  }

  function primaryMarkdownFor(uploadId: string): UploadArtifact | null {
    const primary = artifactStateFor(uploadId).primary
    return primary && isPrimaryMarkdown(primary) && !!primary.raw_url ? primary : null
  }

  function maybeSelectDefaultArtifact(upload: Upload) {
    if (preview.value?.uuid !== upload.uuid || artifactView.value || isRawRenderable(upload.mime_type)) return
    const markdown = primaryMarkdownFor(upload.uuid)
    if (markdown) artifactView.value = markdown
  }

  function previewView(upload: Upload): PreviewSource {
    return { contentType: upload.mime_type, sourceUrl: `/api/v1/uploads/${upload.uuid}/raw`, filename: upload.filename || upload.uuid }
  }

  function activePreviewSource(upload: Upload): PreviewSource {
    if (artifactView.value?.raw_url) {
      return {
        contentType: artifactView.value.mime_type || 'application/octet-stream',
        sourceUrl: artifactView.value.raw_url,
        filename: artifactLabel(artifactView.value),
      }
    }
    if (!isRawRenderable(upload.mime_type)) {
      const markdown = primaryMarkdownFor(upload.uuid)
      if (markdown?.raw_url) {
        return {
          contentType: markdown.mime_type || 'text/markdown',
          sourceUrl: markdown.raw_url,
          filename: artifactLabel(markdown),
        }
      }
    }
    return previewView(upload)
  }

  function openPreview(upload: Upload) {
    if (!canPreview(upload)) return
    if (artifactView.value && preview.value?.uuid !== upload.uuid) artifactView.value = null
    preview.value = upload
    // Load the extracted parts up front so their chips appear alongside the file;
    // clicking a chip swaps the viewer (no hidden tab).
    void loadArtifacts(upload)
  }

  function closePreview() {
    preview.value = null
    artifactView.value = null
  }

  function viewOriginal() {
    artifactView.value = null
  }

  function viewPrimary() {
    const primary = preview.value ? primaryMarkdownFor(preview.value.uuid) : null
    if (primary) artifactView.value = primary
  }

  function viewArtifact(artifact: UploadArtifact) {
    if (!artifact.raw_url) return
    artifactView.value = artifact
  }

  const currentArtifacts = computed(() => preview.value
    ? artifactStateFor(preview.value.uuid).parts
    : [])
  const partsTotal = computed(() => preview.value ? artifactStateFor(preview.value.uuid).total : 0)
  const partsPage = computed(() => preview.value ? artifactStateFor(preview.value.uuid).page : 1)
  const partsPages = computed(() => Math.max(1, Math.ceil(partsTotal.value / PARTS_PER_PAGE)))
  const partsRangeStart = computed(() => partsTotal.value ? (partsPage.value - 1) * PARTS_PER_PAGE + 1 : 0)
  const partsRangeEnd = computed(() => Math.min(partsTotal.value, (partsPage.value - 1) * PARTS_PER_PAGE + currentArtifacts.value.length))
  const hasPrimary = computed(() => !!(preview.value && primaryMarkdownFor(preview.value.uuid)))
  const artifactsLoading = computed(() => !!(preview.value && artifactStateFor(preview.value.uuid).loading))

  function gotoPartsPage(page: number) {
    if (!preview.value) return
    const nextPage = Math.min(Math.max(1, page), partsPages.value)
    if (nextPage === partsPage.value) return
    void loadArtifacts(preview.value, true, nextPage)
  }

  function activeRawUrl(): string {
    if (artifactView.value?.raw_url) return artifactView.value.raw_url
    if (preview.value && !isRawRenderable(preview.value.mime_type)) {
      const markdown = primaryMarkdownFor(preview.value.uuid)
      if (markdown?.raw_url) return markdown.raw_url
    }
    return preview.value ? `/api/v1/uploads/${preview.value.uuid}/raw` : ''
  }

  function activeName(): string {
    if (artifactView.value) return artifactLabel(artifactView.value)
    if (preview.value && !isRawRenderable(preview.value.mime_type)) {
      const markdown = primaryMarkdownFor(preview.value.uuid)
      if (markdown) return artifactLabel(markdown)
    }
    return preview.value ? (preview.value.filename || preview.value.uuid) : 'download'
  }

  // Upload URLs require the bearer token, so a bare <a href> 401s. Fetch through
  // the authenticated host client and hand the browser a blob URL instead.
  async function fetchBlobUrl(url: string): Promise<string | null> {
    if (!url) return null
    try {
      const response = await api.get<Blob>(url, { responseType: 'blob' })
      return URL.createObjectURL(response.data)
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'failed to fetch file'
      return null
    }
  }

  async function downloadActive() {
    if (busyAction.value) return
    busyAction.value = true
    try {
      const url = await fetchBlobUrl(activeRawUrl())
      if (!url) return
      const anchor = document.createElement('a')
      anchor.href = url; anchor.download = activeName(); anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } finally { busyAction.value = false }
  }

  async function openActive() {
    if (busyAction.value) return
    busyAction.value = true
    try {
      const url = await fetchBlobUrl(activeRawUrl())
      if (url) {
        window.open(url, '_blank', 'noopener')
        setTimeout(() => URL.revokeObjectURL(url), 60000)
      }
    } finally { busyAction.value = false }
  }

  async function loadArtifacts(upload: Upload, force = false, toPage = 1) {
    const current = artifactStateFor(upload.uuid)
    if ((current.loaded || current.loading) && !force) return
    setArtifactState(upload.uuid, { ...current, loading: true, error: '' })
    try {
      const offset = (toPage - 1) * PARTS_PER_PAGE
      const { data } = await api.get(`/api/v1/uploads/${upload.uuid}/artifacts`, { params: { limit: PARTS_PER_PAGE, offset } })
      if (!data.success) {
        setArtifactState(upload.uuid, { ...current, loaded: true, loading: false, error: data.error || 'failed to load artifacts', primary: null, parts: [], total: 0, page: toPage })
        return
      }
      // The backend returns the primary separately and the page of parts already
      // excludes source/primary; stay defensive and filter/derive client-side so a
      // full-list response still renders correctly.
      const raw: UploadArtifact[] = data.artifacts || []
      const primary = data.primary || raw.find((artifact) => isPrimaryMarkdown(artifact) && !!artifact.raw_url) || null
      const parts = raw.filter((artifact) => !isSourceArtifact(artifact) && !isPrimaryMarkdown(artifact))
      setArtifactState(upload.uuid, {
        loaded: true, loading: false, error: '',
        primary,
        parts,
        total: Number(data.meta?.total ?? parts.length),
        page: toPage,
      })
      if (toPage === 1) maybeSelectDefaultArtifact(upload)
    } catch (cause) {
      setArtifactState(upload.uuid, { ...current, loaded: true, loading: false, error: cause instanceof Error ? cause.message : 'failed to load artifacts' })
    }
  }

  return {
    preview, artifactView, artifactsByUpload, partsExpanded, busyAction,
    artifactStateFor, isSourceArtifact, primaryMarkdownFor, activePreviewSource,
    openPreview, closePreview, viewOriginal, viewPrimary, viewArtifact,
    currentArtifacts, partsTotal, partsPage, partsPages, partsRangeStart, partsRangeEnd,
    hasPrimary, artifactsLoading, gotoPartsPage, downloadActive, openActive,
  }
}
