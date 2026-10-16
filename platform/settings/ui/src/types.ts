// The Settings page fetches its own block catalog and renders a left-nav of
// blocks. An optional `route` deep-links to a block by key (the host passes it
// via the `route` attribute); unset selects the first block.
export interface ComponentProps {
  route?: string
}
