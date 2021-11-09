import styles from '@app/components/summary-view/summary-view.module.css'
import { Entities } from '@app/data'
import cx from 'classnames'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import Button from 'react-bootstrap/Button'

import { BsFillInfoSquareFill } from 'react-icons/bs'

interface Props {
  plan: Entities.TerraformPlan
}

export const C = (props: Props) => {
  const { plan } = props

  let totalResources: number = 0
  let totalChanges: number = 0
  let created: number = 0
  let destroyed: number = 0
  let modified: number = 0
  let varsManaged: number = Object.keys(plan.variables).length

  for (const resource of plan.resource_changes) {
    const actionAlias = Entities.Utils.TerraformPlanResourceChangeChange.getActionAlias(resource.change)
    switch (actionAlias) {
      case Entities.TerraformPlanResourceChangeChangeActionAlias.CreateDelete:
      case Entities.TerraformPlanResourceChangeChangeActionAlias.DeleteCreate:
        destroyed++
      case Entities.TerraformPlanResourceChangeChangeActionAlias.Create:
        created++
        break
      case Entities.TerraformPlanResourceChangeChangeActionAlias.Delete:
        destroyed++
        break
      case Entities.TerraformPlanResourceChangeChangeActionAlias.Update:
        modified++
        break
    }
    if (actionAlias !== Entities.TerraformPlanResourceChangeChangeActionAlias.Noop &&
      actionAlias !== Entities.TerraformPlanResourceChangeChangeActionAlias.Unknown)
    {
      totalChanges++
    }
    totalResources++
  }

  const rows = [
    {
      info: 'Total number of resources managed in this plan',
      label: 'Total resources managed',
      value: totalResources
    },
    {
      info: 'Total number of variables managed in this plan',
      label: 'Total variables managed',
      value: varsManaged
    },
    {
      info: 'Total number of resources modified out of other Terraform apply',
      label: 'Total resources drifted',
      value: `${plan.resource_drift.length} (${(plan.resource_drift.length/totalResources).toFixed(2)} % of managed)`
    },
    {
      info: 'Total number of resources that will be changed in this plan',
      label: 'Total resources changed',
      value: `${totalChanges} (${(totalChanges / totalResources * 100).toFixed(2)} % of managed)`
    },
    {
      info: 'Total number of resources to be created in this plan',
      label: 'Resources created',
      value: `${created} (${(created / totalChanges * 100).toFixed(2)} % of changed)`
    },
    {
      info: 'Total number of resources to be destroyed in this plan',
      label: 'Resources destroyed',
      value: `${destroyed} (${(destroyed / totalChanges * 100).toFixed(2)} % of changed)`
    },
    {
      info: 'Total number of resources to be modified in this plan',
      label: 'Resources modified',
      value: `${modified} (${(modified / totalChanges * 100).toFixed(2)} % of changed)`
    },
    {
      info: 'Total number of resources to be created in this plan',
      label: 'Total resources created',
      value: `${created} (${(created / totalChanges * 100).toFixed(2)} % of changed)`
    },
    {
      info: 'Terraform plan file format version used to generate this plan',
      label: 'Plan format version',
      value: `v${plan.format_version}`
    },
    {
      info: 'Terraform CLI version used to generate this plan',
      label: 'Terraform version',
      value: `v${plan.terraform_version}`
    },
  ]
  return (
    <>
      <Container className="pt-1">
        <Row>
          <Col>
            <h3>Plan summary</h3>
          </Col>
        </Row>
        {rows.map((info, idx) => (
          <Row key={idx}>
            <Col md={1}>
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip>{info.info}</Tooltip>}
              >
                <Button variant="outline-dark" size="sm">
                  <BsFillInfoSquareFill title={info.info}/>
                </Button>
              </OverlayTrigger>
            </Col>
            <Col md={5}>{info.label}:</Col>
            <Col>{info.value}</Col>
          </Row>
        ))}
      </Container>
    </>
  )
}
