import React, {Component} from 'react'
import DropdownButton from '../../../../../node_modules/react-bootstrap/lib/DropdownButton'
import MenuItem from '../../../../../node_modules/react-bootstrap/lib/MenuItem'
import Checkbox from '../../../../../node_modules/react-bootstrap/lib/Checkbox'

class SubscribeButton extends Component {
  render () {
    const title = <i className='fa fa-rss' aria-hidden='true' />
    return <DropdownButton bsStyle='default' title={title} id={'subscribe-btn'} data-tooltip='Subscribe' style={{display: 'none'}}>
      <MenuItem eventKey='1'>
        <Checkbox checked onChange={(event) => console.log(event)}>
          All
        </Checkbox>
      </MenuItem>
      <MenuItem eventKey='2'>Document content</MenuItem>
      <MenuItem eventKey='3'>Comments</MenuItem>
      <MenuItem eventKey='3'>Subdocuments</MenuItem>
    </DropdownButton>
  }
}

export default SubscribeButton
