import {
  Phone
} from './phone-model.js';

const app = getApp();

Page({
  data: {
    from: ''
  },
  onLoad: function(options) {
    const from = options.from
    if (from) {
      this.setData({ from });
    }
  },
  bindGetPhoneNumber(e) {
    let phone = new Phone();
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      phone.binding(e.detail)
        .then(res => {
          app.globalData.userInfo = res.data.user;
          if (this.data.from === 'publish') {
            wx.showModal({
              title: '提示',
              content: '绑定成功, 通过实名认证之后才能发布行程哦！',
              confirmText: '实名认证',
              success: res => {
                if (res.confirm) {
                  wx.redirectTo({
                    url: `/pages/realname/realname?from=${this.data.from}`
                  })
                } else {
                  wx.navigateBack({
                    delta: 1
                  })
                }
              }
            })
          } else {
            wx.navigateBack({
              delta: 1
            })
          }
        })
        .catch(error => {})
    }
  }
})
