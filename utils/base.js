import {
  Config
} from 'config'
import {
  Token
} from 'token'

class Base {
  constructor() {
    this.baseRequestUrl = Config.restUrl;
  }

  /**
   * @param {Object} params 参数
   * @param {Boolean} noRefetch 是否重发
   * @returns {Promise} promise
   */
  ajax(params, noRefetch) {
    const promise = new Promise((resolve, reject) => {
      /**
       * @url https://developers.weixin.qq.com/miniprogram/dev/api/network-request.html
       */
      wx.request({
        url: this.baseRequestUrl + params.url,
        data: params.data || '',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'token': wx.getStorageSync('token')
        },
        method: params.method || 'POST',
        dataType: 'json',
        responseType: 'text',
        success: response => {
          const statusCode = response.statusCode;
          const { data } = response;
          if (statusCode === 200 || statusCode === 201) {
            if (data.errcode === 0 || data.errcode === '0') {
              resolve(data);
              return;
            }

            let err = new Error(data.errmsg);

            // errcode 是业务代码
            switch (data.errcode) {
              case 10000:
                err.message = '系统错误';
                wx.showToast({ title: err.message });
                reject(err);
                break;

              // token失效或不存在
              case 10001:
                // 已经重发过一次
                console.log('token失效', '是否重发过了: ', !!noRefetch);
                if (noRefetch) {
                  err.message = '登录异常';
                  reject(err);
                } else {
                  console.log('重新获取');
                  resolve(this.__refetch(params)); // 重新获取令牌
                }
                break;

              case 10003:
                err.message = '参数错误';
                wx.showToast({ title: err.message });
                reject(err);
                break;

              case 10007:
                err.message = '未绑定手机号'
                reject(err);
                wx.showModal({
                  title: '提示',
                  content: err.message,
                  confirmText: '去绑定',
                  success: (e) => {
                    if (e.confirm) {
                      wx.navigateTo({
                        url: '/pages/phone/phone'
                      });
                    }
                  }
                })

              case 10006:
                err.message = '未实名认证';
                reject(err);
                wx.showModal({
                  title: '提示',
                  content: err.message,
                  confirmText: '去实名',
                  success: (e) => {
                    if (e.confirm) {
                      wx.navigateTo({
                        url: '/pages/realname/realname'
                      })
                    }
                  }
                });
                break;

              case 10012:
                err.message = '不是车主';
                wx.showModal({
                  title: '提示',
                  content: err.message,
                  confirmText: '成为车主',
                  success: (e) => {
                    if (e.confirm) {
                      wx.navigateTo({
                        url: '/pages/driver/driver'
                      })
                    }
                  }
                })
                reject(err);
                break;

              case 10013:
                err.message = '姓名号码不匹配';
                wx.showToast({ title: err.message });
                let times = wx.getStorageSync('realnameCallable') || 1;
                wx.setStorageSync('realnameCallable', ++times);
                reject(err);
                break;

              default:
                break;
            }
          } else {
            let err = new Error(data.errmsg);
            switch (statusCode) {
              case 400:
                err.message = '请求错误';
                wx.showToast({ title: err.message });
                reject(err);
                break;

              case 404:
                err.message = params.url
                wx.showToast({ title: '请求地址不存在' });
                reject(err);
                break;

              case 500:
                err.message = '服务器内部错误';
                reject(err);
                wx.showToast({ title: err.message });
                break

              case 502:
                err.message = '网关错误'
                reject(err);
                wx.showToast({ title: err.message });
                break

              case 503:
                err.message = '服务不可用'
                reject(err);
                wx.showToast({ title: err.message });
                break

              case 504:
                err.message = '网关超时'
                reject(err);
                wx.showToast({ title: err.message });
                break
              default:
            }
          }
        },
        fail: function(error) {
          console.log(error);
        },
        complete: function(res) {},
      })
    });
    return promise;
  }

  __refetch(params) {
    const promise = new Promise((resolve, reject) => {
      const token = new Token();
      console.log('从服务器获取token')
      token.getTokenFromServer()
        .then(res => {
          // 此次请求失败则不再进行重发机制
          wx.setStorageSync('token', res.token);   // 更新本地缓存
          resolve(this.ajax(params, true));        // 重新发送请求，并标记为不重发
        })
    })
    return promise;
  }
}

export {
  Base
}
