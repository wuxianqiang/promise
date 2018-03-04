# promise

```js
function Promise(excutor) {
  let self = this
  self.state = 'padding'
  self.value = undefined
  self.reason = undefined

  function resolve(value) {
    if (self.state === 'paddding') {
      status.value = value
      status.state = 'resolved'
    }
  }

  function reject(reason) {
    if (self.state === 'paddding') {
      status.reason = reason
      status.state = 'rejected'
    }
  }
  
  try {
    excutor(resolve, reject)
  } catch (err) {
    reject(err)
  }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  if (self.status === 'resolved') {
    onFulfilled(self.value)
  }
  if (self.status === 'rejected') {
    onRejected(self.reason)
  }
}
```

## 实现简单调用
```js
function Promise(excutor) {
  let self = this
  self.state = 'padding'
  self.value = undefined
  self.reason = undefined
  self.onFulfilledCallBacks = []
  self.onRejectedCallBacks = []

  function resolve(value) {
    if (self.state === 'paddding') {
      status.value = value
      status.state = 'resolved'
      self.onFulfilledCallBacks.forEach(item => item(self.value))
    }
  }

  function reject(reason) {
    if (self.state === 'paddding') {
      status.reason = reason
      status.state = 'rejected'
      self.onRejectedCallBacks.forEach(item => item(self.reason))
    }
  }

  try {
    excutor(resolve, reject)
  } catch (err) {
    reject(err)
  }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  if (self.status === 'resolved') {
    onFulfilled(self.value)
  }
  if (self.status === 'rejected') {
    onRejected(self.reason)
  }
  if (self.status === 'padding') {
    self.onFulfilledCallBacks.push(onFulfilled)
    self.onRejectedCallBacks.push(onRejected)
  }
}
```
## 实现链式调用
```js
function Promise(excutor) {
  let self = this
  self.state = 'padding'
  self.value = undefined
  self.reason = undefined
  self.onFulfilledCallBacks = []
  self.onRejectedCallBacks = []

  function resolve(value) {
    if (self.state === 'paddding') {
      status.value = value
      status.state = 'resolved'
      self.onFulfilledCallBacks.forEach(item => item(self.value))
    }
  }

  function reject(reason) {
    if (self.state === 'paddding') {
      status.reason = reason
      status.state = 'rejected'
      self.onRejectedCallBacks.forEach(item => item(self.reason))
    }
  }

  try {
    excutor(resolve, reject)
  } catch (err) {
    reject(err)
  }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  if (self.status === 'resolved') {
    return new Promise(function (resolve, reject) {
      let promise2 = onFulfilled(self.value)
      if (promise2 instanceof Promise) {
        promise2.then(resolve, reject)
      } else {
        resolve(promise2)
      }
    })
  }

  if (self.status === 'rejected') {
    return new Promise(function (resolve, reject) {
      let promise2 = onRejected(self.reason)
      if (promise2 instanceof Promise) {
        promise2.then(resolve, reject)
      } else {
        resolve(promise2)
      }
    })
  }

  if (self.status === 'padding') {
    self.onFulfilledCallBacks.push(
      function (resolve, reject) {
        let promise2 = onFulfilled(self.value)
        if (promise2 instanceof Promise) {
          promise2.then(resolve, reject)
        } else {
          resolve(promise2)
        }
      }
    )
    self.onRejectedCallBacks.push(
      function (resolve, reject) {
        let promise2 = onRejected(self.reason)
        if (promise2 instanceof Promise) {
          promise2.then(resolve, reject)
        } else {
          resolve(promise2)
        }
      }
    )
  }
}
```
## 实现catch方法
```js
function Promise(excutor) {
  let self = this
  self.state = 'padding'
  self.value = undefined
  self.reason = undefined
  self.onFulfilledCallBacks = []
  self.onRejectedCallBacks = []

  function resolve(value) {
    if (self.state === 'paddding') {
      status.value = value
      status.state = 'resolved'
      self.onFulfilledCallBacks.forEach(item => item(self.value))
    }
  }

  function reject(reason) {
    if (self.state === 'paddding') {
      status.reason = reason
      status.state = 'rejected'
      self.onRejectedCallBacks.forEach(item => item(self.reason))
    }
  }

  try {
    excutor(resolve, reject)
  } catch (err) {
    reject(err)
  }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function (data) {
    resolve(data)
  }
  onRejected = typeof onRejected === 'function' ? onRejected : function (err) {
    throw err
  }
  if (self.status === 'resolved') {
    return new Promise(function (resolve, reject) {
      try {
        let promise2 = onFulfilled(self.value)
        if (promise2 instanceof Promise) {
          promise2.then(resolve, reject)
        } else {
          resolve(promise2)
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  if (self.status === 'rejected') {
    return new Promise(function (resolve, reject) {
      try {
        let promise2 = onRejected(self.reason)
        if (promise2 instanceof Promise) {
          promise2.then(resolve, reject)
        } else {
          resolve(promise2)
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  if (self.status === 'padding') {
    self.onFulfilledCallBacks.push(
      function (resolve, reject) {
        let promise2 = onFulfilled(self.value)
        if (promise2 instanceof Promise) {
          promise2.then(resolve, reject)
        } else {
          resolve(promise2)
        }
      }
    )
    self.onRejectedCallBacks.push(
      function (resolve, reject) {
        let promise2 = onRejected(self.reason)
        if (promise2 instanceof Promise) {
          promise2.then(resolve, reject)
        } else {
          resolve(promise2)
        }
      }
    )
  }
}

Promise.prototype.catch = function (callback) {
  this.then(null, callback)
}
```
