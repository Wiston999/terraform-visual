import React from 'react'
import { within, render } from '@testing-library/react'
import { SummaryView } from '../../components'

const globalPlan = require('../plan.json');

const fields = [
  'Total resources managed',
  'Total variables managed',
  'Total resources drifted',
  'Total resources changed',
  'Resources created',
  'Resources destroyed',
  'Resources modified',
  'Total resources created',
  'Plan format version',
  'Terraform version'
]

describe('SummaryView', () => {

  it('renders an empty plan', () => {
    const plan = {
    }

    render(<SummaryView.C plan={plan} />)
  })

  it('renders a plan', () => {
    const plan = globalPlan;

    render(<SummaryView.C plan={plan} />)
  })

  fields.forEach((field) => {
    it(`renders field '${field}'`, () => {
      const plan = globalPlan;

      const {queryByText} = render(<SummaryView.C plan={plan} />)

      expect(queryByText(new RegExp(field))).toBeTruthy()
    })
  })
})
