import styles from '@app/components/list-view/list-view.module.css'
import { Entities } from '@app/data'
import { BsSlash, BsPlus, BsDash } from 'react-icons/bs'

interface Props {
  plan?: Entities.TerraformPlan
  focusedResource?: Entities.TerraformPlanResourceChange

  setFocusedResource: Function
}

export const C = (props: Props) => {
  const { plan, focusedResource, setFocusedResource } = props

  let resourceList: JSX.Element[] = []
  let i = 0;

  for (const resource of plan.resource_changes) {
    if (
      Entities.Utils.TerraformPlanResourceChangeChange.getActionAlias(resource.change) ===
      Entities.TerraformPlanResourceChangeChangeActionAlias.Noop
    ) {
      continue
    }
    const actionAlias = Entities.Utils.TerraformPlanResourceChangeChange.getActionAlias(resource.change)
    const [actionSymbol, actionTitle] = getActionSymbolTitle(actionAlias)
    let rowClass = getRowClassActionAlias(actionAlias)

    if (focusedResource?.address === resource.address) {
      rowClass = `${rowClass} ${styles.rowSelected}`
    }

    resourceList.push(
      <div onClick={() => setFocusedResource(resource)} className={`${styles.row} ${rowClass}`} key={i++}>
        <span title={actionTitle} className={styles.actionSymbol}>
          {actionSymbol}
        </span>
        <span className={styles.actionAddress}>
          {resource.address}
        </span>
      </div>,
    )
  }

  return (
    <div className={styles.container} >
      <div className={`${styles.row} ${styles.rowHeader}`}>
        <span>
          Resources modified
        </span>
      </div>
      {resourceList}
    </div>
  )
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
      return styles.rowUpdate
  }
}
