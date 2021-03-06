import { Meteor } from 'meteor/meteor'
import { Groups } from '../../groups/lib/collections'
import { GroupChatTopics, GroupChatMessages } from './collections'
import { GroupChatTopicSchema } from './schema'
import { check } from 'meteor/check'
import { rateLimit } from '../../../common/lib/rate-limit'

const checkIfUserIsAMember = function (members, userId) {
  for (var i = 0, len = members.length; i < len; i++) {
    if (members[i].userId === userId) {
      return true
    }
  }
  return false
}

const isMemberInGroup = function (groupId, userId) {
  const group = Groups.findOne({ _id: groupId })
  if (group) {
    return group.createdBy === userId || checkIfUserIsAMember(group.members, userId)
  } else {
    return false
  }
}

Meteor.methods({
  createGroupChatTopic: function (newGroupChatTopic) {
    check(newGroupChatTopic, GroupChatTopicSchema)
    if (this.userId) {
      if (isMemberInGroup(newGroupChatTopic.groupId, this.userId)) {
        return GroupChatTopics.insert(newGroupChatTopic)
      } else {
        throw new Meteor.Error(401, 'You are not a member of this group!')
      }
    } else {
      throw new Meteor.Error(401)
    }
  },
  sendGroupMessage: function (groupId, topicId, messageText) {
    check(groupId, String)
    check(topicId, String)
    check(messageText, String)
    if (this.userId) {
      const newGroupChatMessage = {
        channelId: topicId,
        groupId: groupId,
        message: messageText,
        createdAt: new Date(),
        from: this.userId,
        emotes: []
      }
      return GroupChatMessages.insert(newGroupChatMessage)
    } else {
      throw new Meteor.Error(401)
    }
  },
  disableGroupChatNotifications: function (groupId, topicId) {
    check(groupId, String)
    check(topicId, String)
    if (this.userId) {
      if (isMemberInGroup(groupId, this.userId)) {
        GroupChatTopics.update({_id: topicId, groupId: groupId}, {$pull: {wantToBeNotified: {userId: this.userId}}})
      } else {
        throw new Meteor.Error(401, 'You are not a member of this group!')
      }
    } else {
      throw new Meteor.Error(401)
    }
  },
  enableGroupChatNotifications: function (groupId, topicId) {
    check(groupId, String)
    check(topicId, String)
    if (this.userId) {
      if (isMemberInGroup(groupId, this.userId)) {
        GroupChatTopics.update({_id: topicId, groupId: groupId}, {$push: {wantToBeNotified: {userId: this.userId}}})
      } else {
        throw new Meteor.Error(401, 'You are not a member of this group!')
      }
    } else {
      throw new Meteor.Error(401)
    }
  }
})

rateLimit({
  methods: [
    'createGroupChatTopic',
    'sendGroupMessage'
  ],
  limit: 1,
  timeRange: 3000
})
