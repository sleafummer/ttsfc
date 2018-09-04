import { Token } from 'utils/token';
import { User } from 'utils/user';
import { TRIP_TYPE, ROLE_TYPES } from 'utils/constants';

App({
  onLaunch: function() {
    const token = wx.getStorageSync('token'); // 从缓存中读取token
    if (token) {
      this.__fetchUserinfo();
    } else {
      this.__fetchToken();
    }
  },

  // 从服务器获取用户信息
  __fetchUserinfo() {
    console.log('从服务器获取用户信息');
    const user = new User();
    user.get()
      .then(res => {
        this.globalData.userInfo = res.data.user; // 缓存用户信息
        if (this.userInfoCallback) { // 页面获取用户信息的回调
          this.userInfoCallback(res.data.user);
        }
      })
      .catch(error => {
        wx.showToast('获取用户信息失败');
      })
  },

  // 从服务器获取用户token
  __fetchToken() {
    console.log('从服务器获取token');
    const oToken = new Token();
    oToken.getTokenFromServer()
      .then(res => {
        wx.setStorageSync('token', res.token); // 缓存token
        this.globalData.userInfo = res.userInfo; // 缓存用户信息
        if (this.userInfoCallback) { // 页面获取用户信息的回调
          this.userInfoCallback(res.userInfo);
        }
      })
      .catch(error => {
        console.log(error);
      })
  },

  globalData: {
    userInfo: null
  }
})
