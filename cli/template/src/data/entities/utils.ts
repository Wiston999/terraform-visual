import { Entities } from '@app/data'
import isEqual from 'lodash/isEqual'
import * as Diff from 'diff'

export const TerraformPlan = {
  fromJsonStr(jsonStr: string): Entities.TerraformPlan {
    const planJson = JSON.parse(jsonStr)
    return TerraformPlan.fromJson(planJson)
  },

  fromJson(planJson: { [key: string]: any }): Entities.TerraformPlan {
    const plan: Entities.TerraformPlan = { resource_changes: [] }

    for (const resource_change of planJson.resource_changes) {
      const resourceChange: Entities.TerraformPlanResourceChange = {
        address: resource_change.address,
        module_address: resource_change.module_address,
        type: resource_change.type,
        name: resource_change.name,
        change: {
          actions: resource_change.change.actions,
          before: resource_change.change.before,
          after: resource_change.change.after,
          after_unknown: resource_change.change.after_unknown,
          after_sensitive: resource_change.change.after_sensitive,
          before_sensitive: resource_change.change.before_sensitive,
        },
      }

      plan.resource_changes.push(resourceChange)
    }

    return plan
  },
}

export const TerraformPlanResourceChangeFieldDiff = {
  isDiff(
    change: Entities.TerraformPlanResourceChangeFieldDiff
  ): boolean {
    return !isEqual(change.src.value, change.dst.value) || change.dst.unknown_after
  }
}

export const TerraformPlanResourceChangeField = {
  setValueType(
    data: Entities.TerraformPlanResourceChangeField,
    value: any
  ): Entities.TerraformPlanResourceChangeField {
    data.value = value
    data.type = typeof value
    if (value === null) {
      data.type = 'null'
    } else if (Array.isArray(value)){
      data.type = 'array'
      data.value = JSON.stringify(value, null, 4)
    } else if (typeof value === 'object') {
      data.value = JSON.stringify(value, null, 4)
    }
    return data
  }
}

export const TerraformPlanResourceChangeChange = {
  getActionAlias(
    change: Entities.TerraformPlanResourceChangeChange,
  ): Entities.TerraformPlanResourceChangeChangeActionAlias {
    if (change.actions[0] === Entities.TerraformPlanResourceChangeChangeAction.Noop) {
      return Entities.TerraformPlanResourceChangeChangeActionAlias.Noop
    }

    if (change.actions[0] === Entities.TerraformPlanResourceChangeChangeAction.Create) {
      if (change.actions[1] === Entities.TerraformPlanResourceChangeChangeAction.Delete) {
        return Entities.TerraformPlanResourceChangeChangeActionAlias.CreateDelete
      } else {
        return Entities.TerraformPlanResourceChangeChangeActionAlias.Create
      }
    }

    if (change.actions[0] === Entities.TerraformPlanResourceChangeChangeAction.Update) {
      return Entities.TerraformPlanResourceChangeChangeActionAlias.Update
    }

    if (change.actions[0] === Entities.TerraformPlanResourceChangeChangeAction.Delete) {
      if (change.actions[1] === Entities.TerraformPlanResourceChangeChangeAction.Create) {
        return Entities.TerraformPlanResourceChangeChangeActionAlias.DeleteCreate
      } else {
        return Entities.TerraformPlanResourceChangeChangeActionAlias.Delete
      }
    }

    return Entities.TerraformPlanResourceChangeChangeActionAlias.Unknown
  },

  getDiff(
    change: Entities.TerraformPlanResourceChangeChange,
  ): Entities.TerraformPlanResourceChangeChangeDiff {
    const diff: Entities.TerraformPlanResourceChangeChangeDiff = {}

    if (change.before) {
      for (const field of Object.keys(change.before)) {
        if (!diff[field]) {
          diff[field] = {
            src: {} as Entities.TerraformPlanResourceChangeField,
            dst: {} as Entities.TerraformPlanResourceChangeField,
          }
        }

        const beforeChange = change.before[field]
        if (field in change.before_sensitive) {
          diff[field].src.sensitive = true
        }
        diff[field].src = TerraformPlanResourceChangeField.setValueType(
          diff[field].src,
          beforeChange,
        )
      }
    }

    if (change.after) {
      for (const field of Object.keys(change.after)) {
        if (!diff[field]) {
          diff[field] = {
            src: {} as Entities.TerraformPlanResourceChangeField,
            dst: {} as Entities.TerraformPlanResourceChangeField,
          }
        }
        const afterChange = change.after[field]
        if (field in change.after_sensitive){
          diff[field].dst.sensitive = true
        }
        diff[field].dst = TerraformPlanResourceChangeField.setValueType(
          diff[field].dst,
          afterChange,
        )
      }
    }

    for (const field of Object.keys(change.after_unknown)) {
      if (!diff[field]) {
          diff[field] = {
            src: {} as Entities.TerraformPlanResourceChangeField,
            dst: {} as Entities.TerraformPlanResourceChangeField,
          }
      }
      diff[field].dst.unknown_after = true
    }

    // Compute structured diff for better readibility
    for (const field of Object.keys(diff)) {
      const diffChange = diff[field]
      const before = diffChange.src.value ? diffChange.src.value : ''
      const beforeLines = (before.match(/\n/g) || '').length + 1
      const after = diffChange.dst.value ? diffChange.dst.value : ''
      const afterLines = (after.match(/\n/g) || '').length + 1

      if (!(diffChange.src.sensitive || diffChange.dst.sensitive) && (beforeLines > 4 || afterLines > 4)) {
        diffChange.diff = Diff.structuredPatch('', '', before, after, '', '')
      }
    }
    return diff
  },
}

export const TerraformPlanResourceChangeChangeDiff = {
  getUnchangedFields(
    changes: Entities.TerraformPlanResourceChangeChangeDiff
  ): Entities.TerraformPlanResourceChangeChangeDiff {
    const newChanges: Entities.TerraformPlanResourceChangeChangeDiff = {}
    for (const field of Object.keys(changes)) {
      if (!TerraformPlanResourceChangeFieldDiff.isDiff(changes[field])) {
        newChanges[field] = changes[field]
      }
    }
    return newChanges
  }
}
