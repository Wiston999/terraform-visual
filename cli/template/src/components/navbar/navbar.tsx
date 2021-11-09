import styles from '@app/components/navbar/navbar.module.css'

import { Entities } from '@app/data'

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import cx from 'classnames';
import Link from 'next/link'

interface Props {
  view: Entities.AppView
  setView: Function
}

export const C = (props: Props) => {
  const { view, setView } = props
  return (
    <>
      <Navbar bg="dark" variant="dark" className={styles.navbar} >
        <Container fluid>
          <Navbar.Brand href="#index">Terraform Visual</Navbar.Brand>
          <Navbar.Collapse className="justify-content-end">
            <Nav>
              <ViewSelector view={view} toggleFn={setView} />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}

interface ViewSelectorProps {
  view: Entities.AppView
  toggleFn: Function
}

const ViewSelector = (props: ViewSelectorProps) => {
  const { view, toggleFn } = props

  const listClass = {}
  const treeClass = {}

  listClass[styles.buttonActive] = view == Entities.AppView.List
  treeClass[styles.buttonActive] = view == Entities.AppView.Tree
  return (
    <>
    <ButtonGroup>
      <ToggleButton variant="outline-light" size="sm"
        value={Entities.AppView.List}
        type="radio"
        checked={view === Entities.AppView.List}
        className={cx(styles.button, listClass)}
        onClick={() => toggleFn(Entities.AppView.List)} >
        List view
      </ToggleButton>
      <ToggleButton variant="outline-light" size="sm"
        value={Entities.AppView.Tree}
        type="radio"
        checked={view === Entities.AppView.Tree}
        className={cx(styles.button, treeClass)}
        onClick={() => toggleFn(Entities.AppView.Tree)}
      >
        Tree view
      </ToggleButton>
    </ButtonGroup>
    </>
  )
}
