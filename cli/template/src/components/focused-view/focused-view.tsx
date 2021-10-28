import styles from '@app/components/focused-view/focused-view.module.css'
import React, { useState } from 'react';
import capitalize from 'lodash/capitalize';
import { Entities } from '@app/data'
import { BsLink45Deg, BsCheckCircle, BsSlashCircle, BsHash } from 'react-icons/bs'
import { RiBracesLine, RiBracketsLine } from "react-icons/ri";
import { FaEquals, FaChevronRight } from 'react-icons/fa'

interface Props {
  resource?: Entities.TerraformPlanResourceChange
}

export const C = (props: Props) => {
  const { resource } = props
  const [showUnchanged, setShowUnchanged] = useState(false)

  if (!resource) {
    return <div className={styles.container} />
  }

  const diff = Entities.Utils.TerraformPlanResourceChangeChange.getDiff(resource.change)
  const actionAlias = Entities.Utils.TerraformPlanResourceChangeChange.getActionAlias(resource.change)
  const unchangedCount = Entities.Utils.TerraformPlanResourceChangeChangeDiff.getUnchangedFields(diff)

  return (
    <div className={styles.container}>
      <div className={styles.rowAddress}>
        <div className={styles.address}>
          {resource.address}
        </div>
        <div className={styles.rowToggle}>
          <Actions actions={resource.change.actions} />
          <UnchangedToggle toggleValue={showUnchanged} toggleFn={setShowUnchanged} count={Object.keys(unchangedCount).length}/>
        </div>
      </div>
      {Object.keys(diff).map((field, key) => (
        <ChangedField key={key} field={field} changes={diff[field]} actionAlias={actionAlias} showUnchanged={showUnchanged} />
      ))}
    </div>
  )
}

interface ActionsProps {
  actions: string[]
}

const Actions = (props: ActionsProps) => {
  const { actions } = props
  const actionElems: JSX.Element[] = []

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i]
    const colorClassName = getActionsColorClassName(action)

    actionElems.push(
      <span key={2 * i} className={colorClassName}>
        {capitalize(action)}
      </span>,
    )

    if (i !== actions.length - 1) {
      actionElems.push(<span key={2 * i + 1}> then </span>)
    }
  }

  return (
    <>
    {actionElems}
    </>
  )
}

const getActionsColorClassName = (action: string): string => {
  switch (action) {
    case Entities.TerraformPlanResourceChangeChangeAction.Create: {
      return styles.colorGreen
    }
    case Entities.TerraformPlanResourceChangeChangeAction.Update: {
      return styles.colorYellow
    }
    case Entities.TerraformPlanResourceChangeChangeAction.Delete: {
      return styles.colorRed
    }
    default: {
      return ''
    }
  }
}

interface UnchangedToggleProps {
  count: number
  toggleValue: boolean
  toggleFn: (any) => unknown
}

const UnchangedToggle = (props: UnchangedToggleProps) => {
  const { count, toggleValue, toggleFn } = props

  const showStr = toggleValue ? 'Hide' : 'Show'

  return (
    <>
    <button className={styles.button} onClick={() => toggleFn(!toggleValue)}>
      {showStr} {count} unchanged elements
    </button>
    </>
  )
}

interface ChangedFieldProps {
  field: string
  changes: Entities.TerraformPlanResourceChangeFieldDiff
  actionAlias: Entities.TerraformPlanResourceChangeChangeActionAlias
  showUnchanged: boolean
}

const ChangedField = (props: ChangedFieldProps) => {
  const { showUnchanged, field, changes, actionAlias } = props

  const [beforeChangeColorClassName, afterChangeColorClassName] = getFieldChangeColorClassName(
    actionAlias,
  )

  const hiddenClass = Entities.Utils.TerraformPlanResourceChangeFieldDiff.isDiff(changes) || showUnchanged ?
    '' : styles.rowHide

  const isDiff = Entities.Utils.TerraformPlanResourceChangeFieldDiff.isDiff(changes)
  const separator = isDiff ?
    <FaChevronRight title='Field changes'/> : <FaEquals title='Field is unchanged'/>

  const fieldType = getFieldTypeIcon(changes.dst ? changes.dst.type : changes.src.type)

  const detailView = changes.diff && isDiff ?
    <UnifiedDiffView changes={changes.diff} /> :
    <ColumsFieldView changes={changes} actionAlias={actionAlias} />

  return (
    <div className={`${styles.row} ${hiddenClass}`}>
      <div className={styles.rowHeader} title={field}>
      {fieldType} {field}
      </div>
      {detailView}
    </div>
  )
}

interface UnifiedDiffViewProps {
  changes: Diff.ParsedDiff
}

const UnifiedDiffView = (props: UnifiedDiffViewProps) => {
  const { changes } = props

  let lines : JSX.Element[] = []
  let index = 0;

  lines.push(<hr key={index++} className={styles.diffHr}/>)
  for (const hunk of changes.hunks) {
    let oldStart = hunk.oldStart
    let newStart = hunk.newStart
    for (const line of hunk.lines) {
      const className = getDiffLineColorClassName(line[0])
      let oldNumber = null
      let newNumber = null
      switch (line[0]) {
        case '+':
          newNumber = newStart++
          break
        case '-':
          oldNumber = oldStart++
          break
        default:
          newNumber = newStart++
          oldNumber = oldStart++
          break
      }

      lines.push(
        <div key={index++} className={styles.diffRow}>
          <span className={styles.diffOldLine}>{oldNumber}</span>
          <span className={styles.diffNewLine}>{newNumber}</span>
          <span className={className}>{line}</span>
        </div>,
      )
    }
    lines.push(<hr key={index++} className={styles.diffHr} />)
  }

  return (
    <>
      <div className={`${styles.rowBefore}`}>
        <pre>{lines}</pre>
      </div>
    </>
  )
}

const getDiffLineColorClassName = (
  changeType: string
): string => {
  switch (changeType) {
    case '+':
      return styles.colorGreen
    case '-':
      return styles.colorRed
    default:
      return ''
  }
}

interface ColumsFieldViewProps {
  changes: Entities.TerraformPlanResourceChangeFieldDiff
  actionAlias: Entities.TerraformPlanResourceChangeChangeActionAlias
}

const ColumsFieldView = (props: ColumsFieldViewProps) => {
  const { changes, actionAlias } = props

  const [beforeChangeColorClassName, afterChangeColorClassName] = getFieldChangeColorClassName(
    actionAlias,
  )

  const separator = Entities.Utils.TerraformPlanResourceChangeFieldDiff.isDiff(changes) ?
    <FaChevronRight title='Field changes'/> : <FaEquals title='Field is unchanged'/>

  const elements: JSX.Element[] = []

  if (actionAlias != Entities.TerraformPlanResourceChangeChangeActionAlias.Create) {
    elements.push(
      <div key='1' className={`${styles.rowBefore} ${beforeChangeColorClassName}`}>
        <pre>{changes.src.value}</pre>
      </div>,
    )
  }
  if (actionAlias != Entities.TerraformPlanResourceChangeChangeActionAlias.Delete &&
    actionAlias != Entities.TerraformPlanResourceChangeChangeActionAlias.Create)
  {
    elements.push(
      <div key='2' className={styles.rowArrow}>
        {separator}
      </div>,
    )
  }
  if (actionAlias != Entities.TerraformPlanResourceChangeChangeActionAlias.Delete) {
    elements.push(
      <div key='3' className={`${styles.rowAfter} ${afterChangeColorClassName}`}>
        <pre>{changes.dst.value}</pre>
      </div>,
    )
  }
  return (
    <>
    {elements}
    </>
  )
}

const getFieldTypeIcon = (
  input: string
): JSX.Element => {
  if (input === 'null') {
    return <BsSlashCircle title={input} />
  }
  if (input === 'string') {
    return <BsLink45Deg title={input} />
  }
  if (input === 'number') {
    return <BsHash title={input} />
  }
  if (input === 'boolean') {
    return <BsCheckCircle title={input} />
  }
  if (input === 'array') {
    return <RiBracketsLine title={input} />
  }
  return <RiBracesLine title={input}/>
}

const getFieldChangeColorClassName = (
  actionAlias: Entities.TerraformPlanResourceChangeChangeActionAlias,
): [string, string] => {
  switch (actionAlias) {
    case Entities.TerraformPlanResourceChangeChangeActionAlias.Create:
      return [styles.colorGreen, styles.colorGreen]
    case Entities.TerraformPlanResourceChangeChangeActionAlias.Update:
      return [styles.colorYellow, styles.colorYellow]
    case Entities.TerraformPlanResourceChangeChangeActionAlias.Delete:
      return [styles.colorRed, styles.colorRed]
    case Entities.TerraformPlanResourceChangeChangeActionAlias.CreateDelete:
      return [styles.colorGreen, styles.colorRed]
    case Entities.TerraformPlanResourceChangeChangeActionAlias.DeleteCreate:
      return [styles.colorRed, styles.colorGreen]
    default:
      return [styles.colorYellow, styles.colorYellow]
  }
}
