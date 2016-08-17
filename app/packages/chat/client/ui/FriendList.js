import { Meteor } from 'meteor/meteor'
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import { composeWithTracker } from 'react-komposer'
import CollapsibleFilterContainer from './CollapsibleFilterContainer'
import AddFriendModal from './AddFriendModal'
import { FriendRequests, FriendLists } from '../../lib/collections'
import OpenFriendRequests from './OpenFriendRequests'
import InnerFriendList from './InnerFriendList'
import Button from '../../../../../node_modules/react-bootstrap/lib/Button'
import EventEmitterInstance from '../../../../common/client/EventEmitter'

class ActiveFilterTestComp extends Component {
  render () {
    return <div>{this.props.activeFilter}</div>
  }
}

ActiveFilterTestComp.propTypes = {
  activeFilter: React.PropTypes.bool
}

function onPropsChange2 (props, onData) {
  let handle = Meteor.subscribe('friendChat', {friendId: props.friendId})
  if (handle.ready()) {
    let friend = Meteor.users.findOne({_id: props.friendId})
    onData(null, {friend})
  }
}

class FriendChat extends Component {
  close () {
    EventEmitterInstance.emit('close-friend-small-chat')
  }
  render () {
    const { friendId, friend } = this.props
    console.log(friendId)
    return <div id='small-friend-chat' style={{position: 'relative'}}>
      <div style={{
        display: 'block',
        textAlign: 'center',
        padding: '7px 5px',
        backgroundColor: 'lightgrey',
        height: '35px',
        fontWeight: 'bold'
      }}>
        <span className='glyphicon glyphicon-comment' style={{marginRight: '5px'}} />
        {friend.profile.name}
      </div>
      <div style={{
        position: 'absolute',
        top: 0,
        marginTop: '-3px',
        right: '5px',
        fontWeight: 'bold',
        fontSize: '30px',
        cursor: 'pointer'
      }} onClick={() => this.close()}>
        &times;
      </div>
      <div className='chat-body' style={{
        height: 'calc(100vh - 197px)',
        backgroundColor: '#FEF9E7'
      }}>
      </div>
    </div>
  }
}

FriendChat.propTypes = {
  friendId: React.PropTypes.string,
  friend: React.PropTypes.object
}

const FriendChatWithData = composeWithTracker(onPropsChange2)(FriendChat)

function onPropsChange (props, onData) {
  let handle = Meteor.subscribe('friendList')
  let openFriendRequests = FriendRequests.find({status: 'pending'}).fetch()
  if (handle.ready()) {
    let friendList = FriendLists.findOne({ userId: Meteor.userId() })
    onData(null, {openFriendRequests, friendList})
  } else {
    const friendRequestsLoading = true
    onData(null, {openFriendRequests, friendRequestsLoading})
  }
}

class FriendContainer extends Component {
  render () {
    const { friendList, openFriendRequests } = this.props
    return <div className='friend-container'>
      {openFriendRequests && openFriendRequests.length > 0 ? (
        <OpenFriendRequests
          openFriendRequests={openFriendRequests}
          friendRequestsLoading={this.props.friendRequestsLoading} />
      ) : null}
      <CollapsibleFilterContainer alwaysOpen filters={['All', 'Online', 'History']} activeFilter={'Online'}>
        <InnerFriendList friendList={friendList} />
      </CollapsibleFilterContainer>
    </div>
  }
}

FriendContainer.propTypes = {
  friendRequestsLoading: React.PropTypes.bool,
  openFriendRequests: React.PropTypes.array,
  friendList: React.PropTypes.object
}

const FriendContainerWithData = composeWithTracker(onPropsChange)(FriendContainer)

class FriendList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      openAddFriendModal: null,
      friendChat: null
    }
  }
  componentDidMount () {
    this.smallChatWindowOpenSubscription = EventEmitterInstance.addListener('open-friend-small-chat', (friendId) => {
      this.setState({friendChat: friendId})
    })
    this.smallChatWindowCloseSubscription = EventEmitterInstance.addListener('close-friend-small-chat', () => {
      this.setState({friendChat: null})
    })
  }
  componentWillUnmount () {
    if (this.smallChatWindowOpenSubscription) {
      this.smallChatWindowOpenSubscription.remove()
    }
    if (this.smallChatWindowCloseSubscription) {
      this.smallChatWindowCloseSubscription.remove()
    }
  }
  openAddFriendModal () {
    let renderToElement = this.refs.addFriendModal
    if (!this.state.openAddFriendModal) {
      this.state.openAddFriendModal = ReactDOM.render(<AddFriendModal />, renderToElement)
    } else {
      this.state.openAddFriendModal.open()
    }
  }
  render () {
    return <div className='ld-friendlist'>
      <div className='top-bar'>
        <Button bsSize='small' onClick={() => this.openAddFriendModal()}>
          <span className='glyphicon glyphicon-plus' />
          &nbsp;Add a friend
        </Button>
        <input type='text' className='form-control' placeholder='Find...' />
        <div ref='addFriendModal'></div>
      </div>
      <hr className='no-margin' />
      {this.state.friendChat === null ? <FriendContainerWithData /> : <FriendChatWithData friendId={this.state.friendChat} />}
    </div>
  }
}

export default FriendList
