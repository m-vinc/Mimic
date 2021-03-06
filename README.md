# Mimic

A meteor package to mimic other users

## Installation

Add package:
```
meteor add mvinc:mimic
```

## Usage

### Server side

You need to create a new Meteor methods, this method will be call each time someone is trying to mimic a user, so you can check who can mimic or not.

Here is a security method example
```javascript
'Mimic.security' (originalId, currentId, targetId) {
  if (Authority.userCan(originalId, ['mimic'])) {
    return true
  } return false
}
```

**originalId** is the id of the user who initiates the first mimic.

**currentId** is the current id of the user, if you mimic a user this argument will be equal to the id of this user.

**targetId** is the id of the user you want to mimic

Here, I use [chap:authority](https://github.com/marcchapeau/meteor-authority) to check if the user have the permission to 'mimic'

### Client side

You need to set the security method name.

```javascript
import Mimic from 'mvinc:mimic'

Mimic.securityMethod = 'Mimic.security'

```

Now you can use all the methods of the client API.

## Client API

The callback expose always the same arguments.

**err** which is a standard `Meteor.Error` and **res** which is the id of the user setted.

### Mimic.setMasks(callback)

Restore the current mimic state, useful in the Accounts.onLogin callback if you want to persist the mimic after a refresh.

```javascript
Mimic.setMasks((err, res) => console.log(res))
```

### Mimic.mask(userId, callback)

Mimic the user with the _id `userId`

```javascript
Mimic.mask('SXwdJERzhs5gfuegH', (err, res) => console.log(res))
```

### Mimic.unmask(callback)

Restore the previous user mimiced

```javascript
Mimic.unmask((err, res) => console.log(res))
```

### Mimic.resetMasks(callback)

Be yourself !

```javascript
Mimic.resetMasks((err, res) => console.log(res))
```
