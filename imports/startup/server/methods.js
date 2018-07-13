import { check, Match } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'

import Mimics from 'meteor/b42:mimic/imports/collections/Mimics'

Meteor.methods({
  'Mimic.mask' (securityMethod, targetId, token) {
    check(token, Match.Maybe(String))
    check(targetId, String)
    check(securityMethod, String)
    const err = err => new Meteor.Error(`Mimic.masking`, err)
    if (targetId === this.userId) throw err('Cannot mimic yourself')
    const authorisation = Meteor.call(securityMethod, token)
    if (!authorisation) throw err('Forbidden')
    if (token) {
      const mimic = Mimics.findOne({token})
      if (mimic) {
        Mimics.update(mimic._id, {$set: {masks: mimic.masks.concat(targetId)}})
        this.setUserId(targetId)
        return { targetId }
      } else {
        Mimics.remove({user: this.userId})
        return false
      }
    } else {
      const nToken = Random.secret()
      Mimics.insert({user: this.userId, token: nToken, masks: [targetId]})
      this.setUserId(targetId)
      return {targetId, token: nToken}
    }
  },
  'Mimic.getMasks' (securityMethod, token) {
    check(securityMethod, String)
    check(token, String)
    const err = err => new Meteor.Error(`Mimic.masking`, err)
    const authorisation = Meteor.call(securityMethod, token)
    if (!authorisation) throw err('Forbidden')
    const mimic = Mimics.findOne({ token })
    if (mimic) {
      const targetId = mimic.masks[mimic.masks.length - 1]
      this.setUserId(targetId)
      return { targetId }
    } else {
      Mimics.remove({user: this.userId})
      return false
    }
  },
  'Mimic.unmask' (securityMethod, token) {
    check(token, Match.Maybe(String))
    check(securityMethod, String)
    const err = err => new Meteor.Error(`Mimic.unmasking`, err)
    const authorisation = Meteor.call(securityMethod, token)
    if (!authorisation) throw err('Forbidden')
    const mimic = Mimics.findOne({ token })
    if (mimic) {
      const res = {}
      mimic.masks.pop()
      if (mimic.masks.length <= 0) {
        res.reset = true
        res.targetId = mimic.user
        Mimics.remove({ token })
      } else {
        res.targetId = mimic.masks[mimic.masks.length - 1]
        Mimics.update({ token }, {$set: {masks: mimic.masks}})
      }
      this.setUserId(res.targetId)
      return res
    } else return false
  },
  'Mimic.resetMasks' (securityMethod, token) {
    check(token, Match.Maybe(String))
    check(securityMethod, String)
    const err = err => new Meteor.Error(`Mimic.unmasking`, err)
    const authorisation = Meteor.call(securityMethod, token)
    if (!authorisation) throw err('Forbidden')
    const mimic = Mimics.findOne({ token })
    if (mimic) {
      Mimics.remove({ token })
      this.setUserId(mimic.user)
      return {targetId: mimic.user}
    }
    return false
  }
})
