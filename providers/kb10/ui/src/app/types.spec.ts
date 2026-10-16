import { describe, expect, it } from 'vitest'
import {
  contentDeletePayload,
  nodeLabel,
  hitDocTitle,
  type BrowseNode,
  type GraphConcept,
  type GraphEdge,
  attachedDocIdsOf,
  conceptIdsForDoc,
  subPagesOf,
  relatedOf,
  childCountOf,
  conceptIcon,
  buildTree,
  buildClusterColors,
  isRawRenderable,
  uploadIdOf,
} from './types'

function node(metadata: Record<string, any>): BrowseNode {
  return { id: 'node-1', metadata }
}

describe('contentDeletePayload', () => {
  it('deletes an updated source without reusing its prior content event lineage', () => {
    const sourceRef = {
      kind: 'manual', external_source: 'knowledge.kb', external_id: 'northwind-revision',
      external_version: '2', thread_id: 'kb-thread', thread_event_id: 'revision-event', thread_event_seq: 2,
    }
    const payload = contentDeletePayload(node({ title: 'Northwind Dispatch Revision', source_ref: sourceRef }))!
    expect(payload.source_ref).toEqual({
      kind: 'manual', external_source: 'knowledge.kb', external_id: 'northwind-revision', external_version: '2',
    })
    expect(payload.metadata.source_ref).toEqual(payload.source_ref)
    expect(sourceRef.thread_event_id).toBe('revision-event')
  })

  it('preserves stored source-ref identity for durable deletes', () => {
    const payload = contentDeletePayload(node({
      title: 'Stored upload',
      source_ref: {
        kind: 'upload',
        external_id: 'upload:file-1',
        external_version: 'v1',
        upload_id: 'file-1',
        filename: 'doc.txt',
      },
    }))

    expect(payload).toMatchObject({
      external_id: 'upload:file-1',
      external_version: 'v1',
      upload_id: 'file-1',
      metadata: {
        title: 'Stored upload',
        node_id: 'node-1',
      },
      source_ref: {
        kind: 'upload',
        external_id: 'upload:file-1',
        external_version: 'v1',
        upload_id: 'file-1',
      },
    })
  })

  it('derives upload identity from metadata external_id', () => {
    const payload = contentDeletePayload(node({ external_id: 'upload:file-2' }))

    expect(payload).toMatchObject({
      external_id: 'upload:file-2',
      upload_id: 'file-2',
    })
  })

  it('derives URL identity from source_url metadata', () => {
    const payload = contentDeletePayload(node({ source_url: 'https://docs.example.test/page' }))

    expect(payload).toMatchObject({
      external_id: 'url:https://docs.example.test/page',
      source_url: 'https://docs.example.test/page',
    })
  })

  it('preserves reference source-ref fields when deleting by stored external id', () => {
    const payload = contentDeletePayload(node({
      external_id: 'reference:cmp-1:abc123',
      reference_component_id: 'cmp-1',
      reference_context: { item_id: '42' },
      source_ref: {
        kind: 'reference',
        origin: 'embed_reference',
      },
    }))

    expect(payload).toMatchObject({
      external_id: 'reference:cmp-1:abc123',
      metadata: {
        source_ref: {
          kind: 'reference',
          external_id: 'reference:cmp-1:abc123',
          reference_component_id: 'cmp-1',
          reference_context: { item_id: '42' },
        },
      },
      source_ref: {
        kind: 'reference',
        origin: 'embed_reference',
        external_id: 'reference:cmp-1:abc123',
        reference_component_id: 'cmp-1',
        reference_context: { item_id: '42' },
      },
    })
  })

  it('refuses nodes without durable external identity', () => {
    expect(contentDeletePayload(node({ title: 'Legacy loose node' }))).toBeNull()
  })
})

describe('wiki edge-derived relations', () => {
  const concepts: GraphConcept[] = [
    { id: 'root', label: 'Root', is_root: true },
    { id: 'topic', label: 'Topic', concept_type: 'topic' },
    { id: 'child', label: 'Child', concept_type: 'topic' },
    { id: 'doc', label: 'Doc', node_type: 'document' },
    { id: 'peer', label: 'Peer', concept_type: 'technology' },
  ]
  const byId = new Map(concepts.map((c) => [c.id, c]))
  const edges: GraphEdge[] = [
    { id: 'e1', from_node_id: 'topic', to_node_id: 'root', edge_type: 'subtopic_of' },
    { id: 'e2', from_node_id: 'child', to_node_id: 'topic', edge_type: 'subtopic_of' },
    { id: 'e3', from_node_id: 'doc', to_node_id: 'topic', edge_type: 'categorized_as' },
    { id: 'e4', from_node_id: 'topic', to_node_id: 'peer', edge_type: 'mentions' },
  ]

  it('resolves documents attached to a concept via categorized_as', () => {
    expect(attachedDocIdsOf(byId.get('topic')!, edges)).toEqual(['doc'])
  })

  it('treats a document concept as its own page', () => {
    expect(attachedDocIdsOf(byId.get('doc')!, edges)).toEqual(['doc'])
  })

  it('lists subtopic children, label-sorted, excluding documents', () => {
    expect(subPagesOf(byId.get('topic')!, edges, byId).map((c) => c.id)).toEqual(['child'])
  })

  it('lists related links excluding hierarchy and attached docs', () => {
    const related = relatedOf(byId.get('topic')!, edges, byId)
    expect(related.map((r) => r.concept.id)).toEqual(['peer'])
    expect(related[0].label).toBe('mentions')
  })

  it('counts direct subtopic children', () => {
    expect(childCountOf('root', edges)).toBe(1)
    expect(childCountOf('topic', edges)).toBe(1)
    expect(childCountOf('child', edges)).toBe(0)
  })

  it('maps concept type to a semantic icon, root and document first', () => {
    expect(conceptIcon(byId.get('root')!)).toBe('tabler:hierarchy-2')
    expect(conceptIcon(byId.get('doc')!)).toBe('tabler:file-text')
    expect(conceptIcon(byId.get('peer')!)).toBe('tabler:cpu')
    expect(conceptIcon({ id: 'x', concept_type: 'unknown' })).toBe('tabler:folder')
  })

  it('recognises raw-renderable mimes (image / audio / video / pdf / office)', () => {
    expect(isRawRenderable('image/png')).toBe(true)
    expect(isRawRenderable('audio/mpeg')).toBe(true)
    expect(isRawRenderable('video/mp4')).toBe(true)
    expect(isRawRenderable('application/pdf')).toBe(true)
    expect(isRawRenderable('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(true)
    expect(isRawRenderable('application/octet-stream')).toBe(false)
    expect(isRawRenderable('')).toBe(false)
  })

  // The uploads text processor never transforms a text/* file (markdown, plain,
  // html, csv...): the KB document's extracted content is the original bytes
  // verbatim. A "View Original" pane for one of these would just re-render the
  // same body and has no distinct source to resolve, so text/* is never
  // raw-renderable — regressing this reopens the "View Original" 404 for plain
  // markdown/text documents (their /source lookup 404s or never differs).
  it('never treats text/* as a raw-renderable original', () => {
    expect(isRawRenderable('text/markdown')).toBe(false)
    expect(isRawRenderable('text/plain')).toBe(false)
    expect(isRawRenderable('text/html')).toBe(false)
    expect(isRawRenderable('text/csv')).toBe(false)
  })

  it('resolves the upload id from source_ref, flat metadata, or upload: external id', () => {
    expect(uploadIdOf({ source_ref: { upload_id: 'up-1' } })).toBe('up-1')
    expect(uploadIdOf({ upload_id: 'up-2' })).toBe('up-2')
    expect(uploadIdOf({ source_ref: { external_id: 'upload:up-3' } })).toBe('up-3')
    expect(uploadIdOf({ external_id: 'url:https://x' })).toBe('')
    expect(uploadIdOf(undefined)).toBe('')
  })

  it('builds the hierarchy tree the wiki nav renders', () => {
    const tree = buildTree(concepts, edges)
    expect(tree.map((n) => n.concept.id)).toContain('root')
    const root = tree.find((n) => n.concept.id === 'root')!
    expect(root.children.map((c) => c.concept.id)).toEqual(['topic'])
    expect(root.children[0].children.map((c) => c.concept.id)).toEqual(['child', 'doc'])
  })
})

describe('conceptIdsForDoc', () => {
  const edges: GraphEdge[] = [
    { id: 'e1', from_node_id: 'doc', to_node_id: 'c1', to_label: 'Topic One', edge_type: 'categorized_as' },
    { id: 'e2', from_node_id: 'doc', to_node_id: 'c2', edge_type: 'categorized_as' },
    { id: 'e3', from_node_id: 'doc', to_node_id: 'c1', to_label: 'Topic One', edge_type: 'categorized_as' },
    { id: 'e4', from_node_id: 'other', to_node_id: 'c3', edge_type: 'categorized_as' },
    { id: 'e5', from_node_id: 'doc', to_node_id: 'c4', edge_type: 'subtopic_of' },
  ]

  it('returns the deduped concepts a document is categorized under, with labels', () => {
    expect(conceptIdsForDoc('doc', edges)).toEqual([
      { id: 'c1', label: 'Topic One' },
      { id: 'c2', label: '' },
    ])
  })

  it('ignores edges from other nodes and non-categorized edges', () => {
    const ids = conceptIdsForDoc('doc', edges).map((r) => r.id)
    expect(ids).not.toContain('c3')
    expect(ids).not.toContain('c4')
  })
})

describe('buildClusterColors', () => {
  const concepts: GraphConcept[] = [
    { id: 'root', is_root: true },
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta' },
    { id: 'a1', label: 'Alpha child' },
    { id: 'doc', node_type: 'document', label: 'Doc' },
  ]
  const edges: GraphEdge[] = [
    { id: 'e1', from_node_id: 'a', to_node_id: 'root', edge_type: 'subtopic_of' },
    { id: 'e2', from_node_id: 'b', to_node_id: 'root', edge_type: 'subtopic_of' },
    { id: 'e3', from_node_id: 'a1', to_node_id: 'a', edge_type: 'subtopic_of' },
    { id: 'e4', from_node_id: 'doc', to_node_id: 'a1', edge_type: 'categorized_as' },
  ]

  it('colors every node and gives sibling branches distinct hues', () => {
    const colors = buildClusterColors(concepts, edges)
    expect(colors.size).toBe(5)
    expect(colors.get('a')!.fill).not.toEqual(colors.get('b')!.fill)
  })

  it('shares a branch hue down the chain and tints documents from their branch', () => {
    const colors = buildClusterColors(concepts, edges)
    const hue = (c: string) => c.match(/hsl\((\d+)/)?.[1]
    // a, its child a1, and the document under a1 all sit in branch "a".
    expect(hue(colors.get('a1')!.fill)).toEqual(hue(colors.get('a')!.fill))
    expect(hue(colors.get('doc')!.fill)).toEqual(hue(colors.get('a')!.fill))
    // The document is a desaturated tint, not the same fill as the concept.
    expect(colors.get('doc')!.fill).not.toEqual(colors.get('a')!.fill)
  })
})

describe('document titles', () => {
  it('uses the canonical source reference title in document readers and search', () => {
    const metadata = { source_ref: { kind: 'manual', title: 'Northwind Shipping Policy' } }
    expect(nodeLabel(node(metadata))).toBe('Northwind Shipping Policy')
    expect(hitDocTitle({ id: 'chunk-1', metadata })).toBe('Northwind Shipping Policy')
  })
})
