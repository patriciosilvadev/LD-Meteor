import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { composeWithTracker } from 'react-komposer'
import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session'
import { FlowRouter } from 'meteor/kadira:flow-router-ssr'
import Loader from 'react-loader'
import { SubsManager } from 'meteor/meteorhacks:subs-manager'
import classNames from 'classnames'
import debounce from 'lodash/debounce'
import ButtonToolbar from '../../../../../node_modules/react-bootstrap/lib/ButtonToolbar'
import Button from '../../../../../node_modules/react-bootstrap/lib/Button'
import { Documents } from '../../lib/collections'
import ReactiveInfiniteList from '../../../infiniteList/client/ui/GeneralReactiveInfiniteList'

let DocumentListSubs = new SubsManager({
  cacheLimit: 2,
  expireIn: 1
})

let initialLimit = 20
const subsSessionLimitName = 'documentListSubsInitialLimit'
const subsName = 'reactiveDocumentList'
Session.setDefault(subsSessionLimitName, initialLimit)
Session.setDefault('documentListSearchTerm', '')
let documentListSearchTermObj = {
  searchTerm: ''
}

// TODO remove session variables to prevent rerendering, but update the limit

function onPropsChange (props, onData) {
  let handle = DocumentListSubs.subscribe(subsName, {searchTerm: documentListSearchTermObj.searchTerm, limit: initialLimit})
  if (handle.ready()) {
    let documents = Documents.find({}, { sort: {name: 1} }).fetch()
    onData(null, {documents})
  }
  return () => {
    Session.set(subsSessionLimitName, 20)
    Session.set('documentListSearchTerm', '')
    DocumentListSubs.clear()
  }
}

class ListItem extends Component {
  openDocument (documentId) {
    FlowRouter.go('/document/' + documentId)
  }
  deleteDocument (documentId) {
    const document = Documents.findOne({'_id': documentId})
    if (document) {
      const result = global.confirm('Do you really want to delete the document \'' + document.title + '\'')
      if (result) {
        Meteor.call('deleteDocument', documentId)
      }
    }
  }
  render () {
    const { colWidth, item, expanded } = this.props
    const document = item
    const user = Meteor.users.findOne(document.createdBy)
    const isOwnUser = document.createdBy === Meteor.userId()
    let documentItemClasses = classNames({'div-table-row document-list-item': true, expanded: expanded})
    return <div ref='listItem' className={documentItemClasses}>
      <div className='div-table-col' style={{width: colWidth + 'px'}} onClick={() => this.openDocument(document._id)}>
        {document.title}
      </div>
      <div className='div-table-col' style={{width: colWidth + 'px'}} onClick={() => this.openDocument(document._id)}>
        {user.profile.name}
      </div>
      <div className='div-table-col' style={{width: colWidth + 'px'}} onClick={() => this.openDocument(document._id)}>
        {document.modifiedAt}{' '}
      </div>
      <div className='div-table-col last' style={{width: colWidth + 'px'}}>
        <ButtonToolbar className='options-buttons'>
          {isOwnUser ? <Button className='delete-doc-button' bsSize='small' onClick={() => this.deleteDocument(document._id)}>
            <span className='glyphicon glyphicon-trash' />
          </Button> : null}
          {' '}
        </ButtonToolbar>
      </div>
    </div>
  }
}

ListItem.propTypes = {
  expanded: React.PropTypes.bool,
  item: React.PropTypes.object,
  colWidth: React.PropTypes.number
}

class DocumentListSearchBar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      documentListSearchTerm: documentListSearchTermObj.searchTerm
    }
  }
  prepareToSearch () {}
  componentWillMount () {
    var startSearch = (subsNameCamelCase, argsObj) => {
      Meteor.call('setArgs' + subsNameCamelCase, argsObj)
    }
    // wait until the user starts typing, and then stops
    this.prepareToSearch = debounce(startSearch, 230, {
      'maxWait': 350
    })
  }
  handleSearchInputChange (event, subsName) {
    let searchString = ReactDOM.findDOMNode(event.target).value
    // Session.set('documentListSearchTerm', searchString)
    documentListSearchTermObj.searchTerm = searchString
    let subsNameCamelCase = subsName.substring(0, 1).toUpperCase() + subsName.substring(1, subsName.length)
    let argsObj = {limit: Session.get(subsSessionLimitName)}
    argsObj.searchTerm = searchString
    this.setState({documentListSearchTerm: searchString})
    this.prepareToSearch(subsNameCamelCase, argsObj)
  }
  render () {
    return <input type='text'
      onChange={(event) => this.handleSearchInputChange(event, subsName)}
      placeholder='Find...' value={this.state.documentListSearchTerm} />
  }
}

class DocumentList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      expandedItems: []
    }
  }
  render () {
    const { documents } = this.props
    const expandedItems = this.state.expandedItems
    return <div className='document-list container-fluid'>
      <DocumentListSearchBar />
      <ReactiveInfiniteList
        additionalMethodArgs={[
          documentListSearchTermObj.searchTerm
        ]}
        normalHeight={46}
        expandedHeight={100}
        expandedItems={expandedItems}
        headerLabels={['Document title', 'Author', 'Last update', 'Options']}
        items={documents}
        ListItemComponent={ListItem}
        subsName={subsName}
        subsLimitSessionVarName={subsSessionLimitName} />
    </div>
  }
}

DocumentList.propTypes = {
  documents: React.PropTypes.array
}

const Loading = () => (<Loader loaded={false} options={global.loadingSpinner.options} />)
export default composeWithTracker(onPropsChange, Loading)(DocumentList)
