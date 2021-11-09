import styles from '@app/components/list-view/list-view.module.css'
import { SearchBar } from '@app/components'
import { Entities } from '@app/data'
import { BsSlash, BsPlus, BsDash } from 'react-icons/bs'
import { useState } from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Table from 'react-bootstrap/Table'

interface Props {
  plan?: Entities.TerraformPlan
  focusedResource?: Entities.TerraformPlanResourceChange

  setFocusedResource: Function
}

export const C = (props: Props) => {
  const { plan, focusedResource, setFocusedResource } = props

  const [searchInfo, setSearchInfo] = useState<Entities.SearchInfo>({
    str: '',
    data: true,
    created: true,
    deleted: true,
    modified: true,
    group: Entities.SearchInfoGroupType.ResourceType,
  })

  let resourceList: JSX.Element[] = []
  let resources: { [key: string]: Entities.TerraformPlanResourceChange[] } = {}
  let i = 0;
  let total = 0;

  for (const resource of plan.resource_changes) {
    if (
      Entities.Utils.TerraformPlanResourceChangeChange.getActionAlias(resource.change) ===
      Entities.TerraformPlanResourceChangeChangeActionAlias.Noop
    ) {
      continue
    }
    total++
    const actionAlias = Entities.Utils.TerraformPlanResourceChangeChange.getActionAlias(resource.change)

    if (!filterItem(searchInfo, resource, actionAlias)) {
      continue
    }

    let key: string
    switch (searchInfo.group) {
      case Entities.SearchInfoGroupType.Module:
        key = resource.module_address || 'Root module'
        break
      case Entities.SearchInfoGroupType.ResourceType:
        key = resource.type
        break
    }

    if (resources[key] === undefined) {
      resources[key] = []
    }
    resources[key].push(resource)
  }

  for (const key of Object.keys(resources)) {
    resourceList.push(
      <tr className={`${styles.row} ${styles.rowGroupKey}`} key={key}>
        <td></td>
        <td>
          <strong>{key}</strong>
        </td>
      </tr>,
    )
    for (const resource of resources[key]) {
      const actionAlias = Entities.Utils.TerraformPlanResourceChangeChange.getActionAlias(resource.change)
      const [actionSymbol, actionTitle] = getActionSymbolTitle(actionAlias)
      let rowClass = getRowClassActionAlias(actionAlias)

      if (focusedResource?.address === resource.address) {
        rowClass = `${rowClass} ${styles.rowSelected}`
      }

      resourceList.push(
        <tr onClick={() => setFocusedResource(resource)} className={`${styles.row} ${rowClass}`} key={i++}>
          <td title={actionTitle}>
            {actionSymbol}
          </td>
          <td>
            {resource.address}
          </td>
        </tr>,
      )
    }
  }

  return (
    <>
      <Container fluid className="pt-1">
        <Row>
          <Col md={3}>
            <SearchBar search={searchInfo} setSearch={setSearchInfo} />
          </Col>
          <Col className={styles.tableColumn} >
            <Row>
              <h4>
                Showing {i} out of {total} total resources
              </h4>
            </Row>
            <Row className={styles.tableContent}>
              <Table hover size="sm">
                <tbody>
                  {resourceList}
                </tbody>
              </Table>
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  )
}

const filterItem = (
  searchInfo: Entities.SearchInfo,
  item: Entities.TerraformPlanResourceChange,
  action: Entities.TerraformPlanResourceChangeChangeActionAlias
): boolean => {
  let filter = false
  if (item.address.includes(searchInfo.str)) {
    filter = true
  }

  if (!searchInfo.data && item.address.startsWith('data.')) {
    filter = false
  }

  switch (action) {
    case Entities.TerraformPlanResourceChangeChangeActionAlias.Create:
      filter = filter && searchInfo.created
      break
    case Entities.TerraformPlanResourceChangeChangeActionAlias.Update:
      filter = filter && searchInfo.modified
      break
    case Entities.TerraformPlanResourceChangeChangeActionAlias.Delete:
      filter = filter && searchInfo.deleted
      break
    case Entities.TerraformPlanResourceChangeChangeActionAlias.CreateDelete:
      filter = filter && (searchInfo.deleted || searchInfo.created)
      break
    case Entities.TerraformPlanResourceChangeChangeActionAlias.DeleteCreate:
      filter = filter && (searchInfo.deleted || searchInfo.created)
      break
  }

  return filter
}

const getActionSymbolTitle = (
  action: Entities.TerraformPlanResourceChangeChangeActionAlias,
): [string, string]  => {
  switch (action) {
    case Entities.TerraformPlanResourceChangeChangeActionAlias.Create:
      return ['+', 'Create']
    case Entities.TerraformPlanResourceChangeChangeActionAlias.Update:
      return ['~', 'Update']
    case Entities.TerraformPlanResourceChangeChangeActionAlias.Delete:
      return ['-', 'Destroy']
    case Entities.TerraformPlanResourceChangeChangeActionAlias.CreateDelete:
      return ['+/-', 'Create then destroy']
    case Entities.TerraformPlanResourceChangeChangeActionAlias.DeleteCreate:
      return ['-/+', 'Destroy then create']
    default:
      return ['', 'Unknown']
  }
}

const getRowClassActionAlias = (
  action: Entities.TerraformPlanResourceChangeChangeActionAlias,
): string  => {
  switch (action) {
    case Entities.TerraformPlanResourceChangeChangeActionAlias.Create:
      return styles.rowCreate
    case Entities.TerraformPlanResourceChangeChangeActionAlias.Update:
      return styles.rowUpdate
    case Entities.TerraformPlanResourceChangeChangeActionAlias.Delete:
      return styles.rowDelete
    case Entities.TerraformPlanResourceChangeChangeActionAlias.CreateDelete:
      return styles.rowCreateDelete
    case Entities.TerraformPlanResourceChangeChangeActionAlias.DeleteCreate:
      return styles.rowDeleteCreate
    default:
      return styles.rowUnknown
  }
}
