import React from 'react'
import { render, screen } from '@testing-library/react'
import { ListView } from '../../components'
import Entities from '../../data'

describe('ListView', () => {
  const setState = jest.fn();
  const useStateSpy = jest.spyOn(React, 'useState')
  useStateSpy.mockImplementation((init) => [init, setState]);

  it('renders an empty plan', () => {
    const plan = {
    }

    const [focusedResource, setFocusedResource] = React.useState()

    render(<ListView.C plan={plan} focusedResource={focusedResource} setFocusedResource={setFocusedResource}/>)
  })
})
