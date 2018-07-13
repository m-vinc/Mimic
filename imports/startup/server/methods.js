import { check, Match } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'

import Mimics from 'meteor/b42:mimic/imports/collections/Mimics'

const getOriginalId = function (token) {
  const mimic = Mimics.findOne({token})
  if (mimic) return mimic.user
  return this.userId
}

const getAuthorization = function (securityMethod, token, targetId) {
  if (!securityMethod) return true
  const originalId = getOriginalId.bind(this)(token)
  const authorization = Meteor.call(securityMethod, originalId, this.userId, targetId)
  return authorization
}

Meteor.methods({
  'Mimic.mask' (securityMethod, targetId, token) {
    check(token, Match.Maybe(String))
    check(targetId, String)
    check(securityMethod, Match.Maybe(String))
    const err = err => new Meteor.Error(`Mimic.masking`, err)
    if (targetId === this.userId) throw err('Cannot mimic yourself')
    const authorisation = getAuthorization.bind(this)(securityMethod, token, targetId)
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
    check(securityMethod, Match.Maybe(String))
    check(token, String)
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
    check(securityMethod, Match.Maybe(String))
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
    check(securityMethod, Match.Maybe(String))
    const mimic = Mimics.findOne({ token })
    if (mimic) {
      Mimics.remove({ token })
      this.setUserId(mimic.user)
      return {targetId: mimic.user}
    }
    return false
  }
})
