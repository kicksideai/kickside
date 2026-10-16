import type { WfNode } from '../types'
import type { OutPort } from './node-policy'

export interface WfNodeData {
  kind: WfNode['kind']
  kindLabel: string
  title: string
  ref: string
  icon: string
  hueVar: string
  runStatus: string
  outPorts: OutPort[]
  failedPort: boolean
  failedWired: boolean
  pinned: boolean
  boundaryRole?: 'start' | 'finish' | 'error'
  awaitingLabel?: string
  awaitingIcon?: string
  sub?: string
  issue?: string
}

export interface GraphRunState {
  node: Record<string, string>
  edge: Record<string, string>
}

export interface WfNoteData {
  text: string
  kind: 'note' | 'frame'
  width: number
  height: number
  color?: string
}

export interface WfContainerData {
  kind: WfNode['kind']
  label: string
  icon: string
}

export interface ContainerBox {
  x: number
  y: number
  width: number
  height: number
}

export interface DerivedContainer {
  id: string
  kind: WfNode['kind']
  members: string[]
  box: ContainerBox
}
