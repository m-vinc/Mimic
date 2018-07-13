import { check, Match } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'

import Impersonates from 'meteor/b42:impersonate/imports/collections/Impersonates'

Meteor.methods({
  'Impersonate.mask' (securityMethod, targetId, token) {
    check(token, Match.Maybe(String))
    check(targetId, String)
    check(securityMethod, String)
    const err = err => new Meteor.Error(`Impersonate.masking`, err)
    if (targetId === this.userId) throw err('Cannot impersonate yourself')
    const authorisation = Meteor.call(securityMethod, token)
    if (!authorisation) throw err('Forbidden')
    if (token) {
      const impersonate = Impersonates.findOne({token})
      if (impersonate) {
        Impersonates.update(impersonate._id, {$set: {masks: impersonate.masks.concat(targetId)}})
        this.setUserId(targetId)
        return { targetId }
      } else {
        Impersonates.remove({user: this.userId})
        return false
      }
    } else {
      const nToken = Random.secret()
      Impersonates.insert({user: this.userId, token: nToken, masks: [targetId]})
      this.setUserId(targetId)
      return {targetId, token: nToken}
    }
  },
  'Impersonate.getMasks' (securityMethod, token) {
    check(securityMethod, String)
    check(token, String)
    const err = err => new Meteor.Error(`Impersonate.masking`, err)
    const authorisation = Meteor.call(securityMethod, token)
    if (!authorisation) throw err('Forbidden')
    const impersonate = Impersonates.findOne({ token })
    if (impersonate) {
      const targetId = impersonate.masks[impersonate.masks.length - 1]
      this.setUserId(targetId)
      return { targetId }
    } else {
      Impersonates.remove({user: this.userId})
      return false
    }
  },
  'Impersonate.unmask' (securityMethod, token) {
    check(token, Match.Maybe(String))
    check(securityMethod, String)
    const err = err => new Meteor.Error(`Impersonate.unmasking`, err)
    const authorisation = Meteor.call(securityMethod, token)
    if (!authorisation) throw err('Forbidden')
    const impersonate = Impersonates.findOne({ token })
    if (impersonate) {
      const res = {}
      impersonate.masks.pop()
      if (impersonate.masks.length <= 0) {
        res.reset = true
        res.targetId = impersonate.user
        Impersonates.remove({ token })
      } else {
        res.targetId = impersonate.masks[impersonate.masks.length - 1]
        Impersonates.update({ token }, {$set: {masks: impersonate.masks}})
      }
      this.setUserId(res.targetId)
      return res
    } else return false
  },
  'Impersonate.resetMasks' (securityMethod, token) {
    check(token, Match.Maybe(String))
    check(securityMethod, String)
    const err = err => new Meteor.Error(`Impersonate.unmasking`, err)
    const authorisation = Meteor.call(securityMethod, token)
    if (!authorisation) throw err('Forbidden')
    const impersonate = Impersonates.findOne({ token })
    if (impersonate) {
      Impersonates.remove({ token })
      this.setUserId(impersonate.user)
      return {targetId: impersonate.user}
    }
    return false
  }
})
