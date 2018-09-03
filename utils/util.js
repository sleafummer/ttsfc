const formatTime = date => {
  const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
  }
  date = date ? new Date(date) : new Date();
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return {
    datetime: [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':'),
    date: [year, month, day].map(formatNumber).join('-'),
    time: [hour, minute, second].map(formatNumber).join(':')
  }
}

// 提示错误信息
const isError = (msg, that) => {
  that.setData({
    errorMsg: msg,
    showTopTips: true
  });
  setTimeout(function () {
    that.setData({
      errorMsg: '',
      showTopTips: false
    })
  }, 2000);
}

module.exports = {
  formatTime,
  isError
}
