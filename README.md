# promise

Promise对象代表一个异步操作，有三种状态：pending（进行中）、fulfilled（已成功）和rejected（已失败）。
```js
function Promise(excutor) {
  let self = this
  self.status = 'pending'
  self.value = null
  self.reason = null
  function resolve(value) {
    if (self.status === 'pending') {
      self.value = value
      self.status = 'fulfilled'
    }
  }
  function reject(reason) {
    if (self.status === 'pending') {
      self.reason = reason
      self.status = 'rejected'
    }
  }
  try {
    excutor(resolve, reject)
  } catch (err) {
    reject(err)
  }
}
```
Promise接收一个函数作为参数，该函数有两个参数，一个是resolve，表示成功时执行的函数，一个是reject，表示失败失败时执行的函数。resolve执行时传入的参数会作为then方法中第一个函数的参数，reject执行传入的参数会作为then方法中第二函数的参数。
```js
Promise.prototype.then = function (onFulfilled, onRejected) {
  let self = this
  if (self.status === 'fulfilled') {
    onFulfilled(self.value)
  }
  if (self.status === 'rejected') {
    onRejected(self.reason)
  }
}
```
Promise中常常会写一些异步代码，等到异步操作执行完成才会触发resolve或者reject函数，当执行then方法的时候此时的状态还是初始的pending状态，所以为了能取到值，我们可以通过发布订阅模式来写。
## 基本调用
```js
function Promise(excutor) {
  let self = this
  self.status = 'pending'
  self.value = null
  self.reason = null
  self.onFulfilledCallbacks = []
  self.onRejectedCallbacks = []
  function resolve(value) {
    if (self.status === 'pending') {
      self.value = value
      self.status = 'fulfilled'
      self.onFulfilledCallbacks.forEach(item => item(self.value))
    }
  }
  function reject(reason) {
    if (self.status === 'pending') {
      self.reason = reason
      self.status = 'rejected'
      self.onRejectedCallbacks.forEach(item => item(self.reason))
    }
  }
  try {
    excutor(resolve, reject)
  } catch (err) {
    reject(err)
  }
}


Promise.prototype.then = function (onFulfilled, onRejected) {
  let self = this
  if (self.status === 'fulfilled') {
    onFulfilled(self.value)
  }
  if (self.status === 'rejected') {
    onRejected(self.reason)
  }
  if (self.status === 'pending') {
    self.onFulfilledCallbacks.push(onFulfilled)
    self.onRejectedCallbacks.push(onRejected)
  }
}
```
我们都知道Promise有一个特点，就是链式调用，当执行then完成后可以继续执行then方法，其实他的原理就是通过返回一个新的Promise实现的，那么then方法中的代码就可以写成下面这样
```js
Promise.prototype.then = function (onFulfilled, onRejected) {
  let self = this
  if (self.status === 'fulfilled') {
    return new Promise((resolve, reject) => {
      onFulfilled(self.value)
    })
  }
  if (self.status === 'rejected') {
    return new Promise((resolve, reject) => {
      onRejected(self.reason)
    })
  }
  if (self.status === 'pending') {
    return new Promise((resolve, reject) => {
      self.onFulfilledCallbacks.push(onFulfilled)
      self.onRejectedCallbacks.push(onRejected)
    })
  }
}
```
then方法接收的两个函数中，可以通过return把值传给下一个步，也可以返回一个新的Promise把值传给下一步，then方法执行的时候有个特点，就是为了保证链式调用，上一次then中不管你是成功态还是失败态都会把参数作为下一个then中成功时回调的参数，举个例子
```js
let promise1 = new Promise((resolve, reject) => {
  reject('1')
})

let promise2 = promise1.then((res) => {
  return 1
}, (err) => {
  return 2
})
promise2.then((res) => {
  console.log(res)//不管上一次then执行的那个回调函数，在这里都可以接收到参数
})
```
## 实现链式调用
```js
Promise.prototype.then = function (onFulfilled, onRejected) {
  let self = this
  if (self.status === 'fulfilled') {
    return new Promise((resolve, reject) => {
      try {
        let x = onFulfilled(self.value)
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      } catch (err) {
        reject(err)
      }
    })
  }
  if (self.status === 'rejected') {
    return new Promise((resolve, reject) => {
      try {
        let x = onRejected(self.reason)
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      } catch (err) {
        reject(err)
      }
    })
  }
  if (self.status === 'pending') {
    return new Promise((resolve, reject) => {
      self.onFulfilledCallbacks.push(() => {
        let x = onFulfilled(self.value)
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      })
      self.onRejectedCallbacks.push(() => {
        let x = onRejected(self.reason)
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      })
    })
  }
}
```
上面的代码还要再次处理，就是当某个then中没有传成功时的回调函数或失败时的回调函数，代码就是报错，所以要指定默认值
```js
Promise.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled :  function (data) {return data}
  onRejected = typeof onRejected === 'function' ? onRejected : function (err) {throw err}
  let self = this
  if (self.status === 'fulfilled') {
    return new Promise((resolve, reject) => {
      try {
        let x = onFulfilled(self.value)
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      } catch (err) {
        reject(err)
      }
    })
  }
  if (self.status === 'rejected') {
    return new Promise((resolve, reject) => {
      try {
        let x = onRejected(self.reason)
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      } catch (err) {
        reject(err)
      }
    })
  }
  if (self.status === 'pending') {
    return new Promise((resolve, reject) => {
      self.onFulfilledCallbacks.push(() => {
        let x = onFulfilled(self.value)
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      })
      self.onRejectedCallbacks.push(() => {
        let x = onRejected(self.reason)
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      })
    })
  }
}
```
指定默认值得时候注意失败时要继续抛出错误，因为只有代码报错才会走reject函数

## catch方法
其实catch方法就是then方法的简写
```js
Promise.prototype.catch = function (fn) {
  return this.then(null, fn)
}
```
## 完整代码
```js
function Promise(excutor) {
  let self = this
  self.status = 'pending'
  self.value = null
  self.reason = null
  self.onFulfilledCallbacks = []
  self.onRejectedCallbacks = []

  function resolve(value) {
    if (self.status === 'pending') {
      self.value = value
      self.status = 'fulfilled'
      self.onFulfilledCallbacks.forEach(item => item())
    }
  }

  function reject(reason) {
    if (self.status === 'pending') {
      self.reason = reason
      self.status = 'rejected'
      self.onRejectedCallbacks.forEach(item => item())
    }
  }
  try {
    excutor(resolve, reject)
  } catch (err) {
    reject(err)
  }
}


Promise.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled :  function (data) {resolve(data)}
  onRejected = typeof onRejected === 'function' ? onRejected : function (err) {throw err}
  let self = this
  if (self.status === 'fulfilled') {
    return new Promise((resolve, reject) => {
      try {
        let x = onFulfilled(self.value)
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      } catch (err) {
        reject(err)
      }
    })
  }
  if (self.status === 'rejected') {
    return new Promise((resolve, reject) => {
      try {
        let x = onRejected(self.reason)
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      } catch (err) {
        reject(err)
      }
    })
  }
  if (self.status === 'pending') {
    return new Promise((resolve, reject) => {
      self.onFulfilledCallbacks.push(() => {
        let x = onFulfilled(self.value)
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      })
      self.onRejectedCallbacks.push(() => {
        let x = onRejected(self.reason)
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      })
    })
  }
}

Promise.prototype.catch = function (fn) {
  return this.then(null, fn)
}
```
