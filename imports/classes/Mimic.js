import { check, Match } from 'meteor/check'
import { Meteor } from 'meteor/meteor'

const sessionStorage = window.sessionStorage
class Mimic {
  static getToken () {
    return (sessionStorage && sessionStorage.getItem('mimicToken')) || undefined
  }
  static setToken (token) {
    if (!sessionStorage) return
    if (!token) sessionStorage.removeItem('mimicToken')
    else sessionStorage.setItem('mimicToken', token)
  }
  static setMasks () {
    const token = this.getToken()
    if (token) {
      Meteor.call('Mimic.setMasks', token, (err, res) => {
        if (!err && res && res.targetId) {
          Meteor.connection.setUserId(res.targetId)
        } else this.setToken(undefined)
      })
    }
  }
  static mask (targetId, callback) {
    check(callback, Match.Maybe(Function))
    Meteor.call('Mimic.mask', this.securityMethod, targetId, this.getToken(), (err, res) => {
      if (!err) {
        if (res) {
          if (res.token) this.setToken(res.token)
          if (res.targetId) Meteor.connection.setUserId(res.targetId)
          if (callback) callback(null, res.targetId)
        } else {
          this.setToken(undefined)
          if (callback) callback(null, false)
        }
      } else if (callback) callback(err)
    })
  }
  static unmask (callback) {
    check(callback, Match.Maybe(Function))
    Meteor.call('Mimic.unmask', this.getToken(), (err, res) => {
      if (!err) {
        if (res) {
          Meteor.connection.setUserId(res.targetId)
          if (res.reset) this.setToken(undefined)
        } else {
          this.setToken(undefined)
          if (callback) callback(null, false)
        }
      } else if (callback) callback(err)
    })
  }
  static resetMasks (callback) {
    check(callback, Match.Maybe(Function))
    Meteor.call('Mimic.resetMasks', this.getToken(), (err, res) => {
      if (!err) {
        if (res) {
          Meteor.connection.setUserId(res.targetId)
          if (callback) callback(null, res.targetId)
        } else {
          this.setToken(undefined)
          if (callback) callback(null, false)
        }
      } else if (callback) callback(err)
    })
  }
}

export default Mimic
