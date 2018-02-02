function Promise(excutor) {
  let self = this;
  self.status = "padding";
  self.value = undefined;
  self.reason = undefined;

  self.onResolvedCallback = [];
  self.onRejectedCallback =  [];

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
  let self = this;
  // 执行方法，传入值
  if (self.status === "resolved") {
    onFulfilled(self.value);
  }

  if (self.status === "rejected") {
    onRejected(self.reason);
  }

  // 处理异步情况
  if (self.status === "padding") {
    self.onResolvedCallback.push(onRejected);
    self.onRejectedCallback.push(onFulfilled);
  }
}