import type { TreeGraph } from '@antv/g6'
const G6: typeof import('@antv/g6') = process.browser ? require('@antv/g6') : null

import { PlanGraph } from '@app/components'
import styles from '@app/components/plan-graph/plan-graph.module.css'
import { Entities } from '@app/data'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

import Container from 'react-bootstrap/Container'

interface Props {
  plan?: Entities.TerraformPlan
  focusedResource?: Entities.TerraformPlanResourceChange

  setFocusedResource: Function
}

export const C = (props: Props) => {
  const { plan, focusedResource, setFocusedResource } = props
  let selectedItem

  const ref = React.useRef<HTMLDivElement>(null)
  let graph: TreeGraph

  useEffect(() => {
    if (!plan) {
      return
    }

    if (graph) {
      graph.destroy()
    }

    const graphData = PlanGraph.Entities.Utils.GraphData.fromTerraformPlanResourceChange(
      plan.resource_changes,
    )

    graph = new G6.TreeGraph({
      // @ts-ignore
      container: ReactDOM.findDOMNode(ref.current),
      width: ref?.current?.clientWidth || 0,
      height: ref?.current?.clientHeight || 500,
      linkCenter: true,
      modes: {
        default: [
          {
            type: 'collapse-expand',
            onChange(item, collapsed) {
              if (!item) {
                return
              }

              item.get('model').data.collapsed = collapsed
              return true
            },
          },
          'drag-canvas',
          {
            type: 'zoom-canvas',
            // @ts-ignore
            sensitivity: 1,
          },
        ],
      },
      layout: {
        type: 'compactBox',
        direction: 'LR',
        getId: (graphData: PlanGraph.Entities.GraphData) => graphData.id,
        getWidth: () => 0,
        getHGap: (graphData: PlanGraph.Entities.GraphData) => graphData.hGap,
      },
      defaultNode: {
        type: 'rect',

        anchorPoints: [
          [0, 0.5],
          [1, 0.5],
        ],
      },
      defaultEdge: {
        type: 'cubic-horizontal',
        color: ' #e6e6e6',
        size: 3,
      },
    })

    graph.on('node:click', (event: any) => {

      if (!event.item._cfg.model.resource) {
        return
      }

      event.item.update({
        labelCfg: {
          style: {
            fill: PlanGraph.Entities.Utils.COLOR_WHITE
          }
        }
      })

      if (selectedItem) {
        selectedItem.update({
          labelCfg: {
            style: {
              fill: PlanGraph.Entities.Utils.COLOR_BLACK
            }
          }
        })
      }

      selectedItem = event.item
      setFocusedResource(event.item._cfg.model.resource)
    })

    graph.data(graphData)
    graph.render()
    graph.fitView()

    return () => {
      if (!graph) {
        return
      }

      graph.destroy()
    }
  }, [plan])

  if (!plan) {
    return (
      <Container className={styles.container}>
        <p className={styles.loading}>loading graph...</p>
      </Container>
    )
  }

  return <Container className={styles.container} ref={ref} />
}
