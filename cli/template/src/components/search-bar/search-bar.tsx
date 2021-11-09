import styles from '@app/components/search-bar/search-bar.module.css'
import { Entities } from '@app/data'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import FloatingLabel from 'react-bootstrap/FloatingLabel'

import React from "react";

interface IProps {
  search: Entities.SearchInfo

  setSearch: Function
}

interface IState {
}

class SearchBar extends React.Component<IProps, Entities.SearchInfo>{
  constructor(props){
    super(props)
    this.state = {
      str: '',
      data: true,
      deleted: true,
      created: true,
      modified: true,
      group: Entities.SearchInfoGroupType.ResourceType,
    }
    this.handleSearchBar = this.handleSearchBar.bind(this)
  }

  sendSearch() {
    this.props.setSearch(this.state)
  }

  handleSearchBar(value: string){
    this.setState({str: value}, () => this.sendSearch())
  }

  handleGroupChange(value: Entities.SearchInfoGroupType) {
    this.setState({group: value}, () => this.sendSearch())
  }

  handleCheckboxChange(name: string) {
    const change = {}
    change[name] = !this.state[name]
    this.setState(change, () => this.sendSearch())
  }

  render(){
    return (
      <>
        <Container fluid className="pt-2">
          <Row>
            <Col>
              <h5>Filter menu</h5>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form>
                <Form.Group controlId="searchInput">
                  <FloatingLabel controlId="floatingSearch" className="mb-3" label="Search resource">
                    <Form.Control
                      className={styles.searchBar}
                      type="text"
                      value={this.state.str}
                      onChange={(e) => this.handleSearchBar((e.target as HTMLInputElement).value,)}
                    />
                  </FloatingLabel>
                </Form.Group>
                <Form.Group as={Row} controlId="statesCheck">
                  <Form.Label>Filter by change type</Form.Label>
                  <Form.Check
                    type="switch"
                    id="state-data"
                    label="Data source"
                    checked={this.state.data}
                    onChange={() => this.handleCheckboxChange('data')}
                  />
                  <Form.Check
                    type="switch"
                    id="state-created"
                    label="Created"
                    checked={this.state.created}
                    onChange={() => this.handleCheckboxChange('created')}
                  />
                  <Form.Check
                    type="switch"
                    id="state-deleted"
                    label="Deleted"
                    checked={this.state.deleted}
                    onChange={() => this.handleCheckboxChange('deleted')}
                  />
                  <Form.Check
                    type="switch"
                    id="state-modified"
                    label="Modified"
                    checked={this.state.modified}
                    onChange={() => this.handleCheckboxChange('modified')}
                  />
                </Form.Group>
                <Form.Group as={Row} controlId="groupRadios">
                  <Form.Label>Group by</Form.Label>
                  <Form.Check
                    type="radio"
                    id="group-module"
                    label="Module name"
                    checked={this.state.group == Entities.SearchInfoGroupType.Module}
                    onChange={() => this.handleGroupChange(Entities.SearchInfoGroupType.Module)}
                  />
                  <Form.Check
                    type="radio"
                    id="group-resource-type"
                    label="Resource type"
                    checked={this.state.group == Entities.SearchInfoGroupType.ResourceType}
                    onChange={() => this.handleGroupChange(Entities.SearchInfoGroupType.ResourceType)}
                  />
                </Form.Group>
              </Form>
            </Col>
          </Row>
        </Container>
      </>
    )
  }
}

export default SearchBar
