import { TRIP_TYPES, ROLE_TYPES } from './constants';

const app = getApp();

class Auth {
  constructor() {}

  /*
   *  判断权限
   *  page 来自哪个页面 String
   *  action 操作名称 String 'publish' 'call'
   *  condition 某些操作所必须携带的条件
   */
  checkAuth(page, action, condition) {
    const currentUser = app.globalData.userInfo,
      roleName = ROLE_TYPES[currentUser.role].name;
    // 微信用户 - 不管执行任何询问的操作，都返回false
    // 已获取头像和昵称的用户 - 不管执行任何询问的操作，都返回false
    // 已绑定手机号的用户 - 不管执行任何询问的操作，都返回false

    if (roleName === 'WX_USER' ||
      roleName === 'USER_ROLE_WITH_NICKNAME' ||
      roleName === 'USER_ROLE_WITH_PHONE') {
      this.__showModalRealname(page, action); // 实名弹框
      return false;
    }

    // 发布行程
    if (action === 'publish' && TRIP_TYPES[condition].label === '车找人' && roleName === 'USER_ROLE_WITH_REALNAME') {
      this.__showModalDriver(); // 车主认证弹框
      return false;
    }

    // 拨打电话
    if (action === 'call' && TRIP_TYPES[condition].label === '车找人' && roleName === 'USER_ROLE_WITH_REALNAME') {
      this.__showModalDriver(); // 车主认证弹框
      return false;
    }

    return {
      pass: true,
      authMsg: 'auth check pass'
    }
  }

  // 显示实名认证弹窗
  __showModalRealname(page, action) {
    wx.showModal({
      title: '提示',
      content: '您未实名认证',
      cancelText: '暂不认证',
      confirmText: '去认证',
      success: res => {
        if (res.confirm) {
          wx.navigateTo({
            url: `/pages/realname/realname?page=${page}`
          });
        } else {
          this.__cancelNext(page, action);
        }
      }
    })
  }

  __showModalDriver() {
    wx.showModal({
      title: '提示',
      content: '需要您进行车主认证',
      cancelText: '暂不认证',
      confirmText: '去认证',
      success: res => {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/driver/driver' })
        }
      }
    })
  }

  __cancelNext(page, action) {
    if (page === 'publish') {
      wx.switchTab({ url: '/pages/home/home' })
    }
  }
}

module.exports = {
  Auth
}
