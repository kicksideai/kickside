// Props for the shared channel-picker web component. All are attributes on the
// <wc-channel-picker> element. `value` carries the pre-selected channel as a JSON
// object string {connection_id, channel_id}.
export interface ComponentProps {
  connectionsSource?: string
  discoverPath?: string
  providers?: string
  childArg?: string
  value?: string
  placeholder?: string
}
