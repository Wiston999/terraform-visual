import * as Diff from 'diff'

export interface TerraformPlan {
  resource_changes: TerraformPlanResourceChange[]
  terraform_version?: string
  format_version?: string
}

export interface TerraformPlanResourceChange {
  address: string
  module_address?: string
  type: string
  name: string
  change: TerraformPlanResourceChangeChange
}

export interface TerraformPlanResourceChangeChange {
  actions: string[]
  before: { [key: string]: unknown } | null
  before_sensitive: { [key: string]: unknown } | null
  after: { [key: string]: unknown } | null
  after_sensitive: { [key: string]: unknown } | null
  after_unknown: { [key: string]: unknown }
}

export enum TerraformPlanResourceChangeChangeAction {
  Noop = 'no-op',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
}

export enum TerraformPlanResourceChangeChangeActionAlias {
  Unknown,
  Noop,
  Create,
  Update,
  Delete,
  CreateDelete,
  DeleteCreate,
}

export interface TerraformPlanResourceChangeField {
  value: string | null
  type: string
  sensitive: boolean
  unknown_after: boolean
}

export interface TerraformPlanResourceChangeFieldDiff {
  src: TerraformPlanResourceChangeField
  dst: TerraformPlanResourceChangeField
  diff?: Diff.ParsedDiff
}

export interface TerraformPlanResourceChangeChangeDiff {
  [field: string]: TerraformPlanResourceChangeFieldDiff
}
