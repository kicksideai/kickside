import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps, Events } from './types'

export const useComponentProps = () => useProps<ComponentProps>()
export const useComponentEvents = () => useEvents<Events>()
