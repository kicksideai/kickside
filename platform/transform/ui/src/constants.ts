import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps, TransformConfirmedDetail } from './types.ts'

// The negotiation surface's event contract. transform-confirmed carries the
// byte-shape a host writes into its own state. It bubbles and composes through
// the framework's useEvents so a host listens on the
// element wherever it is mounted.
export interface Events {
  'transform-confirmed': TransformConfirmedDetail
}

export const useComponentProps = () => useProps<ComponentProps>()
export const useComponentEvents = () => useEvents<Events>()
