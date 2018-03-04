# promise

## 实现简单调用
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
