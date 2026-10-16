// As the nav surface it fetches its own data (no props). As the workspace "+" ->
// Automation create view it receives the parent folder to place the new automation.
export interface ComponentProps {
  'parent-id'?: string
  'component-id'?: string
  input?: string
  'type-id'?: string
}
