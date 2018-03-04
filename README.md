# promise

```js
function Promise(excutor) {
  let self = this;
  self.status = "padding";
  self.value = undefined;
  self.reason = undefined;

  self.onResolvedCallback = [];
  self.onRejectedCallback = [];

  // 修改状态，保存值
  function resolve(value) {
    if (self.status === "padding") {
      self.status = "resolved";
      self.value = value
      self.onResolvedCallback.forEach(item => item(self.value));
    }
  }

  function reject(reason) {
    if (self.status === "padding") {
      self.status = "rejected";
      self.reason = reason;
      self.onRejectedCallback.forEach(item => item(self.reason));
    }
  }

  try {
    excutor(resolve, reject)
  } catch (error) { //有错误会走向失败
    reject(error)
  }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function (data) {
    resolve(data)
  }
  onRejected = typeof onRejected === 'function' ? onRejected : function (error) {
    throw error
  }
  let self = this;
  // 执行方法，传入值
  let promise2
  if (self.status === "resolved") {
    return new Promise(function (resolve, reject) {
      // 前一个then中不管成功还是失败返回值都会作为下一then中成功时的回调
      try {
        let x = onFulfilled(self.value);
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  if (self.status === "rejected") {
    return new Promise(function (resolve, reject) {
      try {
        let x = onRejected(self.reason);
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  // 处理异步情况
  if (self.status === "padding") {
    return new Promise(function (resolve, reject) {
      self.onResolvedCallback.push(function () {
        let x = onFulfilled(self.value);
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      });
      self.onRejectedCallback.push(function () {
        let x = onRejected(self.reason);
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      });
    })
  }
}
Promise.prototype.catch = function (cb) {
  return this.then(null, cb)
}
```
