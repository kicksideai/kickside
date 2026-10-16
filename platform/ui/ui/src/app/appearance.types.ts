export interface Item {
  id: string
  label: string
  icon: string
  path: string
  route_name: string
  category: string
  order: number
  source?: string
  hidden?: boolean
}
export interface Category { key: string; label: string; icon?: string; order: number }
export interface Override { hidden?: boolean; order?: number; category?: string; label?: string; icon?: string }
