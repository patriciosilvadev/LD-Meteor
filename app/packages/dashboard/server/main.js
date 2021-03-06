import { Meteor } from 'meteor/meteor'
import { Groups } from '../../groups/lib/collections'
import { UserPositions, UserActivityHistory } from '../../dashboard/lib/collections'
import { Documents, DocumentAccess } from '../../document/lib/collections'
import { USERS_DEFAULT } from '../../user/server/userProjections'
import { FriendLists } from '../../chat/lib/collections'
import _uniqBy from 'lodash/uniqBy'
import { _ } from 'meteor/underscore'

function arrayUnique (array) {
  var a = array.concat()
  for (var i = 0; i < a.length; ++i) {
    for (var j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j]) {
        a.splice(j--, 1)
      }
    }
  }

  return a
}

Meteor.publish('activeUserPositions', function () {
  const groupMemberships = Groups.find({$or: [
    {'members.userId': this.userId},
    {createdBy: this.userId}
  ]}).fetch()

  let userIds = []
  groupMemberships.forEach((groupMembership) => {
    if (groupMembership.createdBy !== this.userId) {
      userIds.push(groupMembership.createdBy)
    }
    groupMembership.members.forEach(function (member) {
      userIds.push(member.userId)
    })
  })
  let friendList = FriendLists.findOne({ userId: this.userId })
  if (friendList && friendList.friendIds) {
    userIds = userIds.concat(friendList.friendIds)
  }
  userIds = arrayUnique(userIds)

  // make sure that only when a document is accessible by the user he can see
  // that someone is working on a document
  this.autorun(function () {
    const userPositions = UserPositions.find({ userId: {$in: userIds} }).fetch()
    let documentIds = []
    userPositions.forEach(function (userPosition) {
      documentIds.push(userPosition.elementId)
    })
    let hasAccessToDocumentIds = []
    const createdDocuments = Documents.find({$and: [
      {_id: {$in: documentIds}},
      {createdBy: this.userId}
    ]}, {fields: {id: 1}}).fetch()
    createdDocuments.forEach(function (createdDocument) {
      hasAccessToDocumentIds.push(createdDocument._id)
    })
    let remainingDocumentIds = documentIds.filter(function (remainingDocumentId) {
      return hasAccessToDocumentIds.indexOf(remainingDocumentId) === -1
    })

    // check if the user has access to these documents
    // find all groups the user is a member in
    let groups = Groups.find({$or: [{createdBy: this.userId}, {'members.userId': this.userId}]}, {name: 0, members: 0}).fetch()

    // collect all groupIds
    let groupIds = []
    groups.forEach(function (group) {
      groupIds.push(group._id)
    })

    // find all document access objects that refer to the remaining document ids
    // and where the user doesn't have access
    const documentAccessObjects = DocumentAccess.find(
      {
        $and: [
          {documentId: {$in: remainingDocumentIds}},
          {$and: [
            { 'userCanView.userId': {$nin: [this.userId]} },
            { 'userCanComment.userId': {$nin: [this.userId]} },
            { 'userCanEdit.userId': {$nin: [this.userId]} },
            { 'groupCanView.groupId': {$nin: groupIds} },
            { 'groupCanComment.groupId': {$nin: groupIds} },
            { 'groupCanEdit.groupId': {$nin: groupIds} }
          ]}
        ]
      },
      { userCanView: 0, userCanEdit: 0, userCanComment: 0, groupCanView: 0, groupCanEdit: 0, groupCanComment: 0 }
    ).fetch()

    let doesntHaveAccessToDocumentIds = []
    documentAccessObjects.forEach(function (documentAccessObject) {
      doesntHaveAccessToDocumentIds.push(documentAccessObject.documentId)
    })
    hasAccessToDocumentIds = hasAccessToDocumentIds.concat(remainingDocumentIds.filter(function (remainingDocumentId) {
      return doesntHaveAccessToDocumentIds.indexOf(remainingDocumentId) === -1
    }))
    return [
      Meteor.users.find({_id: { $in: userIds }}, USERS_DEFAULT),
      Documents.find({_id: {$in: hasAccessToDocumentIds}}, {fields: {title: 1}}),
      UserPositions.find({ $and: [{type: 'document'}, {elementId: {$in: hasAccessToDocumentIds}}, {userId: {$in: userIds}}] })
    ]
  })
})

Meteor.publish('activeUserRecentlyVisited', function () {
  const userActivityHistory = UserActivityHistory.find({userId: this.userId}, {sort: {createdAt: -1}, limit: 50}).fetch()
  // get distinct values only
  let distinctDataCollector = []
  let distinctData = _uniqBy(userActivityHistory, 'elementId')
  distinctDataCollector = distinctDataCollector.concat(distinctData)
  let uniqueIds = _.pluck(distinctData, '_id')
  let skip = 50
  let finished = false
  while (uniqueIds.length < 20 && !finished) {
    const userActivityHistory = UserActivityHistory.find({}, {skip: skip, sort: {createdAt: -1}, limit: 50}).fetch()
    distinctData = _uniqBy(userActivityHistory, 'elementId')
    const newValues = _.pluck(distinctData, '_id')
    if (newValues.length === 0) {
      finished = true
    } else {
      distinctDataCollector = distinctDataCollector.concat(distinctData)
      uniqueIds.push(newValues)
      skip += 50
    }
  }
  let documentIds = _.pluck(distinctDataCollector, 'elementId')
  return [
    Documents.find({_id: {$in: documentIds}}, {fields: {title: 1}}),
    UserActivityHistory.find({_id: {$in: uniqueIds}}, {sort: {createdAt: -1}, limit: 20})
  ]
})
