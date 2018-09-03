/**
 * wxPromisify
 * @fn 传入的函数，如wx.request、wx.download
 */

function wxPromisify(fn) {
  return function(obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = res => {
        console.log('obj=========', obj);
        console.log('wxPromisify success');
        resolve(res);
      }

      obj.fail = res => {
        console.log('wxPromisify fail');
        reject(res);
      }

      fn(obj) //执行函数，obj为传入函数的参数
    })
  }
}

module.exports = {
  wxPromisify: wxPromisify
}
