import { Meteor } from 'meteor/meteor'
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import { SubsManager } from 'meteor/meteorhacks:subs-manager'
import { composeWithTracker } from 'react-komposer'
import { DirectMessages } from '../../../lib/collections'
import ChatLineCalculator from '../../lib/chatLineCalculator'

const ChatMsgListSubs = new SubsManager({
  cacheLimit: 2,
  expireIn: 1
})

const initialLimit = 40
const subsName = 'reactiveChatMsgList'

function onPropsChange (props, onData) {
  const handle = Meteor.subscribe(subsName, {friendId: props.friendId, limit: initialLimit})
  let loading = true
  if (handle.ready()) {
    loading = false
    const friend = Meteor.users.findOne({_id: props.friendId})
    const directMessages = DirectMessages.find({ $or: [
      {from: props.friendId, to: Meteor.userId()},
      {from: Meteor.userId(), to: props.friendId}
    ]}, {sort: {createdAt: -1}}).fetch()
    onData(null, {friendId: props.friendId, friend, directMessages, loading})
  } else if (Meteor.isClient) {
    onData(null, {friendId: props.friendId, directMessages: [], loading})
  }
  return () => {
    ChatMsgListSubs.clear()
  }
}

const subsNameAdjusted = subsName.substring(0, 1).toUpperCase() + subsName.substring(1, subsName.length)
class ChatMsgList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isInfiniteLoading: false
    }
  }
  handleScroll (event) {
    event.preventDefault()
    let scrollContainer = ReactDOM.findDOMNode(this.refs.scrollCont)
    const newPos = scrollContainer.scrollTop - event.nativeEvent.deltaY
    const clientHeight = scrollContainer.clientHeight
    // const offsetHeight = scrollContainer.offsetHeight
    const scrollHeight = scrollContainer.scrollHeight
    scrollContainer.scrollTop = newPos
    /* console.log('newPos=', newPos)
    console.log('clientHeight=', clientHeight)
    console.log('offsetHeight=', offsetHeight)
    console.log('scrollHeight=', scrollHeight)
    console.log(`(${newPos} + ${clientHeight}) >= ${scrollHeight}`)
    console.log(newPos + clientHeight)
    console.log((newPos + clientHeight) >= scrollHeight) */
    if (!this.state.isInfiniteLoading && (newPos + 10 + clientHeight) >= scrollHeight) {
      // window.alert('Loading...')
      this.setState({
        isInfiniteLoading: true
      })
      Meteor.setTimeout(function () {
        scrollContainer.scrollTop = newPos + 20
      }, 130)
      Meteor.setTimeout(() => {
        if (this.props.directMessages) {
          let itemsLength = this.props.directMessages.length
          let subsName = subsNameAdjusted
          let argsObj = {limit: itemsLength + 100}
          argsObj.friendId = this.props.friendId
          argsObj.additionalMethodArgs = []
          Meteor.call('setArgs' + subsName, argsObj, (err, res) => {
            if (err) {
              this.setState({
                isInfiniteLoading: false
              })
            }
            if (res) {
              this.setState({
                isInfiniteLoading: false
              })
            }
          })
        }
      }, 0)
    }
  }
  render () {
    const { directMessages } = this.props
    let messageWithEmotesObjects = []
    let messageElementHeights = []
    directMessages.forEach(function (directMessage) {
      let emotes = directMessage.emotes
      if (!emotes) {
        emotes = []
      }
      let formattedEmotes = {}
      emotes.forEach(function (emoteObj) {
        formattedEmotes[emoteObj.key] = emoteObj.range
      })
      let messageWithEmotesObject = new ChatLineCalculator().formatEmotes(directMessage.message, formattedEmotes)
      messageElementHeights.push(messageWithEmotesObject.messageHeight)
      messageWithEmotesObject._id = directMessage._id
      messageWithEmotesObjects.push(messageWithEmotesObject)
    })
    return <ul ref='scrollCont' style={{
      margin: 0,
      paddingLeft: 0,
      fontFamily: '\'Droid Sans Mono\', sans-serif',
      fontSize: '12px',
      overflow: 'auto',
      height: 'calc(100% - 100px)',
      '-webkit-transform': 'scaleY(-1)',
      '-moz-transform': 'scaleY(-1)',
      '-ms-transform': 'scaleY(-1)',
      '-o-transform': 'scaleY(-1)',
      transform: 'scaleY(-1)',
      display: 'inline-block',
      zoom: 1,
      '*display': 'inline',
      width: '100%'
    }} onWheel={(event) => this.handleScroll(event)}>
      {directMessages.map(function (directMessage) {
        let emotes = directMessage.emotes
        if (!emotes) {
          emotes = []
        }
        let formattedEmotes = {}
        emotes.forEach(function (emoteObj) {
          formattedEmotes[emoteObj.key] = emoteObj.range
        })
        let messageWithEmotesObject = new ChatLineCalculator().formatEmotes(directMessage.message, formattedEmotes)
        return <li style={{
          listStyle: 'none',
          '-webkit-transform': 'scaleY(-1)',
          '-moz-transform': 'scaleY(-1)',
          '-ms-transform': 'scaleY(-1)',
          '-o-transform': 'scaleY(-1)',
          transform: 'scaleY(-1)'
        }}>
          {messageWithEmotesObject.lines.map(function (line, i) {
            let lineHeight = 17
            if (line.containsEmoticons) {
              lineHeight = 26
            }
            return <div style={{display: 'block', height: lineHeight + 'px', overflow: 'visible'}} key={'line-' + i}>{line.lineContents.map(function (lineContent, j) {
              return <div style={{display: 'inline'}} key={'line-' + i + '-content-' + j}>{lineContent}</div>
            })}</div>
          })}
        </li>
      })}
      {this.state.isInfiniteLoading ? <li style={{
        listStyle: 'none',
        '-webkit-transform': 'scaleY(-1)',
        '-moz-transform': 'scaleY(-1)',
        '-ms-transform': 'scaleY(-1)',
        '-o-transform': 'scaleY(-1)',
        transform: 'scaleY(-1)'
      }}>Loading...</li> : null}
    </ul>
  }
}

ChatMsgList.propTypes = {
  directMessages: React.PropTypes.array,
  friendId: React.PropTypes.string
}

export default composeWithTracker(onPropsChange)(ChatMsgList)
