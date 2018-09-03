import {
  Config
} from 'config';

class Token {
  constructor() {
    this.tokenUrl = Config.restUrl + '/token/get';
  }

  // 从服务器获取Token
  getTokenFromServer() {
    let that = this;

    let promise = new Promise(function (resolve, reject) {
      wx.login({
        success: function (res) {
          wx.request({
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            url: that.tokenUrl,
            method: 'POST',
            data: {
              code: res.code
            },
            success: function (res) {
              if (res.statusCode === 200 || res.statusCode === 201) {
                // errcode 是业务代码
                if (res.data.errcode === 0 || res.data.errcode === '0') {
                  resolve(res.data.data);
                }
              }
            },
            fail: function (error) {
              reject(error)
            }
          })
        }
      })
    });

    return promise;
  }
}

export {
  Token
}