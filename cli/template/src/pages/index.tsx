import { SummaryView, FocusedView, ListView, PlanGraph } from '@app/components'
import { Entities } from '@app/data'
import styles from '@app/pages/index.module.css'
import { useState } from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

interface Props {
  view: Entities.AppView
  setView: Function
}

const Home = (props: Props) => {
  const { view, setView } = props

  let plan: Entities.TerraformPlan = {
    resource_changes: [],
    variables: {},
    resource_drift: [],
  }

  if (process.browser) {
    //@ts-ignore
    plan = window.TF_PLAN
  }

  const [focusedResource, setFocusedResource] = useState<Entities.TerraformPlanResourceChange>()

  return (
    <Container fluid>
      <Row className={styles.upperRow}>
        <Col md={4}>
          <SummaryView.C plan={plan} />
        </Col>
        <Col md={8}>
          {view == Entities.AppView.List &&
            <ListView.C plan={plan} focusedResource={focusedResource} setFocusedResource={setFocusedResource} />
          }
          {view == Entities.AppView.Tree &&
            <PlanGraph.C plan={plan} focusedResource={focusedResource} setFocusedResource={setFocusedResource} />
          }
        </Col>
      <Row>
      </Row>
        <Col>
          <FocusedView.C resource={focusedResource} />
        </Col>
      </Row>
    </Container>
  )
}

export default Home
