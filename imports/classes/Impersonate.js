import { check } from 'meteor/check'
import { Meteor } from 'meteor/meteor'

class Impersonate {
  constructor (securityMethod) {
    check(securityMethod, String)
    this.securityMethod = securityMethod
  }
  getToken () {
    const sessionStorage = window.sessionStorage
    const res = sessionStorage.getItem('impersonateToken') || undefined
    return res
  }
  setToken (token) {
    const sessionStorage = window.sessionStorage
    if (!token) sessionStorage.removeItem('impersonateToken')
    else sessionStorage.setItem('impersonateToken', token)
  }
  getMasks () {
    const token = this.getToken()
    if (token) {
      Meteor.call('Impersonate.getMasks', this.securityMethod, this.getToken(), (err, res) => {
        if (!err && res && res.targetId) {
          Meteor.connection.setUserId(res.targetId)
        } else this.setToken(undefined)
      })
    }
  }
  masking (targetId) {
    Meteor.call('Impersonate.masking', this.securityMethod, targetId, this.getToken(), (err, res) => {
      if (!err) {
        if (res && res.token) this.setToken(res.token)
        Meteor.connection.setUserId(res.targetId)
      } else this.setToken(undefined)
    })
  }
  unmasking () {
    Meteor.call('Impersonate.unmask', this.securityMethod, this.getToken(), (err, res) => {
      if (!err && res) {
        Meteor.connection.setUserId(res.targetId)
        if (res.reset) this.setToken(undefined)
      } else this.setToken(undefined)
    })
  }
  resetMasks () {
    Meteor.call('Impersonate.resetMasks', this.securityMethod, this.getToken(), (err, res) => {
      if (!err && res) Meteor.connection.setUserId(res.targetId)
      this.setToken(undefined)
    })
  }
}

export default Impersonate
