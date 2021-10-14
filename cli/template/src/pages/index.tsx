import { FocusedView, ListView, PlanGraph } from '@app/components'
import { Entities } from '@app/data'
import styles from '@app/pages/index.module.css'
import { useState } from 'react'

const Home = () => {
  let plan: Entities.TerraformPlan = {resource_changes: []};

  if (process.browser) {
    //@ts-ignore
    plan = window.TF_PLAN
  }

  const [focusedResource, setFocusedResource] = useState<Entities.TerraformPlanResourceChange>()

  return (
    <div className={styles.container}>
      <ListView.C plan={plan} focusedResource={focusedResource} setFocusedResource={setFocusedResource} />
      <PlanGraph.C plan={plan} focusedResource={focusedResource} setFocusedResource={setFocusedResource} />
      <FocusedView.C resource={focusedResource} />
      <div className={styles.metaInfo}>
        Plan format v{plan.format_version} generated using Terraform v{plan.terraform_version}
      </div>
    </div>
  )
}

export default Home
