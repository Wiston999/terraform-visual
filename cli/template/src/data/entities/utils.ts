import { Entities } from '@app/data'
import isEqual from 'lodash/isEqual'
import * as Diff from 'diff'

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
    value: any,
    sensitive: any,
  ): Entities.TerraformPlanResourceChangeField {
    data.sensitive = Boolean(sensitive)
    data.type = typeof value
    data.value = TerraformPlanResourceChangeField.renderValue(
      value,
      sensitive || {},
    )
    if (value === null) {
      data.type = 'null'
    } else if (Array.isArray(value)){
      data.type = 'array'
    }
    if (['number', 'boolean', 'array', 'object'].includes(data.type) && data.value != '(sensitive)') {
        data.value = JSON.stringify(data.value, null, 4)
    }
    return data
  },
  renderValue(
    data: any,
    sensitive_data: any,
  ): string {
    let newData = data
    const dataType = typeof data
    switch (dataType) {
      case 'number':
      case 'boolean':
      case 'string':
        if (sensitive_data === true) {
          newData = '(sensitive)'
        } else if (dataType === 'string') {
          // Try to render if data is a JSON stringified
          try {
            newData = JSON.stringify(JSON.parse(data), null, 4)
          } catch (e) {}
        }
        break
      default: // Asume 'object'
        if (Array.isArray(data)) {
          data.forEach((item, index) => {
            newData[index] = TerraformPlanResourceChangeField.renderValue(
              item,
              sensitive_data[index],
            )
          })
        } else if (data === null) {
          newData = '(null)'
        } else {
          for (const key of Object.keys(data)) {
            newData[key] = TerraformPlanResourceChangeField.renderValue(
              data[key],
              sensitive_data[key],
            )
          }
        }
        break
    }
    return newData
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
            forces_replacement: false,
          }
        }

        diff[field].src = TerraformPlanResourceChangeField.setValueType(
          diff[field].src,
          change.before[field],
          change.before_sensitive[field],
        )
      }
    }

    if (change.after) {
      for (const field of Object.keys(change.after)) {
        if (!diff[field]) {
          diff[field] = {
            src: {} as Entities.TerraformPlanResourceChangeField,
            dst: {} as Entities.TerraformPlanResourceChangeField,
            forces_replacement: false,
          }
        }
        diff[field].dst = TerraformPlanResourceChangeField.setValueType(
          diff[field].dst,
          change.after[field],
          change.after_sensitive[field],
        )
      }
    }

    if (change.replace_paths) {
      for (const field of change.replace_paths) {
        diff[field].forces_replacement = true
      }
    }

    for (const field of Object.keys(change.after_unknown)) {
      if (!diff[field]) {
          diff[field] = {
            src: {} as Entities.TerraformPlanResourceChangeField,
            dst: {} as Entities.TerraformPlanResourceChangeField,
            forces_replacement: false,
          }
      }
      diff[field].dst.unknown_after = true
      diff[field].dst.value = '(known after apply)'
    }

    // Compute structured diff for better readibility
    for (const field of Object.keys(diff)) {
      const diffChange = diff[field]
      const before = diffChange.src.value && !diffChange.src.sensitive ? diffChange.src.value : ''
      const beforeLines = (before.match(/\n/g) || '').length + 1
      const after = diffChange.dst.value && !diffChange.dst.sensitive ? diffChange.dst.value : ''
      const afterLines = (after.match(/\n/g) || '').length + 1

      if (beforeLines > 4 || afterLines > 4) {
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
