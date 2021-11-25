import React from 'react'
import { render, screen } from '@testing-library/react'
import { SummaryView } from '../../components'
import Entities from '../../data'

describe('SummaryView', () => {

  it('renders an empty plan', () => {
    const plan = {
    }

    render(<SummaryView.C plan={plan} />)
  })
})
