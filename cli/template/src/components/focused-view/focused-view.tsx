import styles from '@app/components/focused-view/focused-view.module.css'
import React, { useState } from 'react';
import capitalize from 'lodash/capitalize';
import { Entities } from '@app/data'
import { BsLink45Deg, BsCheckCircle, BsSlashCircle, BsHash } from 'react-icons/bs'
import { RiBracesLine, RiBracketsLine } from "react-icons/ri";
import { FaEquals, FaChevronRight } from 'react-icons/fa'

import cx from 'classnames'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ToggleButton from 'react-bootstrap/ToggleButton'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

interface Props {
  resource?: Entities.TerraformPlanResourceChange
}

export const C = (props: Props) => {
  const { resource } = props
  const [showUnchanged, setShowUnchanged] = useState(false)

  if (!resource) {
    return (
      <Container fluid className={styles.container}>
      </Container>
    )
  }

  const diff = Entities.Utils.TerraformPlanResourceChangeChange.getDiff(resource.change)
  const actionAlias = Entities.Utils.TerraformPlanResourceChangeChange.getActionAlias(resource.change)
  const unchangedCount = Entities.Utils.TerraformPlanResourceChangeChangeDiff.getUnchangedFields(diff)

  return (
    <Container fluid className={cx(styles.container, "py-2")}>
      <Row>
        <Col md={8}>
          <h2 className="text-truncate" title={resource.address}>{resource.address}</h2>
        </Col>
        <Col>
          <Row className="d-flex align-items-center">
            <Col md={{ span: 2, offset: 2 }}>
              <Actions actions={resource.change.actions} />
            </Col>
            <Col md={{ span: 6, offset: 2 }}>
              <UnchangedToggle toggleValue={showUnchanged} toggleFn={setShowUnchanged} count={Object.keys(unchangedCount).length}/>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
      {Object.keys(diff).map((field, key) => (
        <ChangedField key={key} field={field} changes={diff[field]} actionAlias={actionAlias} showUnchanged={showUnchanged} />
      ))}
      </Row>
    </Container>
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
        <strong>{capitalize(action)}</strong>
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
    <ToggleButton
      variant="outline-light"
      type="checkbox"
      value="changed-toggle"
      checked={toggleValue}
      onClick={() => toggleFn(!toggleValue)}
    >
      {showStr} {count} unchanged elements
    </ToggleButton>
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

  const [showDiffView, setShowDiffView] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  const [beforeChangeColorClassName, afterChangeColorClassName] = getFieldChangeColorClassName(
    actionAlias,
  )

  const showRow = Entities.Utils.TerraformPlanResourceChangeFieldDiff.isDiff(changes) || showUnchanged

  const isDiff = changes.diff && Entities.Utils.TerraformPlanResourceChangeFieldDiff.isDiff(changes)
  const separator = isDiff ?
    <FaChevronRight title='Field changes'/> : <FaEquals title='Field is unchanged'/>

  const fieldType = getFieldTypeIcon(changes.dst?.type ? changes.dst.type : changes.src.type)

  const detailView = isDiff && showDiffView ?
    <UnifiedDiffView changes={changes.diff} /> :
    <ColumsFieldView changes={changes} actionAlias={actionAlias} />

  return (
    <Row className={cx(styles.row, {'d-none': !showRow})}>
      <Col md={2}>
        <div title={field}>
          <Row className="text-truncate align-items-center d-flex">
            <Col md={{span: 8}} >
              {fieldType} <strong>{field}</strong>
            </Col>
            <Col md={{span: 2, offset: 2}} >
              <CollapseToggle toggleValue={collapsed} toggleFn={setCollapsed}/>
            </Col>
          </Row>
          {isDiff ? (
            <div className={ styles.viewToggleContainer } >
              <ViewToggle toggleValue={showDiffView} toggleFn={setShowDiffView}/>
            </div>
          ) : null }
        </div>
      </Col>
      <Col md={10} className={collapsed ? styles.collapsedItem : null} >
        {detailView}
      </Col>
    </Row>
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
      <div>
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

  const composedAction: Boolean = actionAlias != Entities.TerraformPlanResourceChangeChangeActionAlias.Delete &&
    actionAlias != Entities.TerraformPlanResourceChangeChangeActionAlias.Create
  const elements: JSX.Element[] = []

  if (actionAlias != Entities.TerraformPlanResourceChangeChangeActionAlias.Create) {
    elements.push(
      <Col key='1' md={composedAction ? 5 : 12} className={cx(styles.detailItem, "text-break", beforeChangeColorClassName)}>
        {changes.src.value}
      </Col>,
    )
  }
  if (composedAction) {
    elements.push(
      <Col key='2' md={2}>
        {separator}
      </Col>,
    )
  }
  if (actionAlias != Entities.TerraformPlanResourceChangeChangeActionAlias.Delete) {
    elements.push(
      <Col key='3' md={composedAction ? 5 : 12} className={cx(styles.detailItem, "text-break", afterChangeColorClassName)}>
        {changes.dst.value}
      </Col>,
    )
  }
  return (
    <>
    <Row>
      {elements}
    </Row>
    </>
  )
}

interface CollapseToggleProps {
  toggleValue: boolean
  toggleFn: (any) => unknown
}

const CollapseToggle = (props: CollapseToggleProps) => {
  const { toggleValue, toggleFn } = props

  const showStr = toggleValue ? '+' : '-'

  return (
    <>
    <ToggleButton
      variant="outline-light"
      title={toggleValue ? 'Expand' : 'Collapse'}
      size="sm"
      type="checkbox"
      value="changed-toggle"
      checked={toggleValue}
      onClick={() => toggleFn(!toggleValue)}
    >
      {showStr}
    </ToggleButton>
    </>
  )
}

interface ViewToggleProps {
  toggleValue: boolean
  toggleFn: (any) => unknown
}

const ViewToggle = (props: ViewToggleProps) => {
  const { toggleValue, toggleFn } = props

  const showStr = toggleValue ? 'Columns' : 'Diff'

  return (
    <>
    <ToggleButton
      variant="outline-light"
      size="sm"
      type="checkbox"
      value="changed-toggle"
      checked={toggleValue}
      onClick={() => toggleFn(!toggleValue)}
    >
      Use {showStr} View
    </ToggleButton>
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
