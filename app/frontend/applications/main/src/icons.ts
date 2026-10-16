import { addCollection } from '@iconify/vue'
import tabler from '@iconify-json/tabler/icons.json'

export type CustomIcon = {
  body: string
  width?: number
  height?: number
  left?: number
  top?: number
  rotate?: number
  hFlip?: boolean
  vFlip?: boolean
}

export function registerShellIcons(customIcons?: Record<string, CustomIcon>) {
  addCollection(tabler)
  if (customIcons) addCollection({ prefix: 'custom', icons: customIcons })
}
