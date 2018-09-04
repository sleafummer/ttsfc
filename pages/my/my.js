import { User } from '../../utils/user';
import { readyUser } from '../../utils/readyUser';
import { DRIVER_AUDIT_STATUS, ROLE_TYPES } from '../../utils/constants';

const app = getApp();

Page({
  data: {
    userInfo: null,
    isRealname: false,
    isDriver: false,
    driverAuditStatus: '' // 车主审核状态
  },
  onLoad: function(options) {
    console.log('onload');
  },
  onShow: function() {
    console.log('onShow');
    this.__getUserInfo().then(userInfo => {
      this.setData({
        userInfo
      });
      this.setUserStatus(userInfo);
    })
  },
  // 异步获取用户信息
  __getUserInfo() {
    return readyUser()
  },

  // 设置用户状态
  setUserStatus(userInfo) {
    const isDriver = ROLE_TYPES[userInfo.role].name === 'USER_ROLE_DRIVER' &&
      DRIVER_AUDIT_STATUS[userInfo.authStatus].name === 'success';
    const isRealname = ROLE_TYPES[userInfo.role].name === 'USER_ROLE_WITH_REALNAME' ||
      ROLE_TYPES[userInfo.role].name === 'USER_ROLE_DRIVER';
    const driverAuditStatus = DRIVER_AUDIT_STATUS[userInfo.authStatus].name;
    this.setData({
      isDriver,
      isRealname,
      driverAuditStatus
    })
  },

  // 获取用户头像信息
  bindGetUserInfo(e) {
    const userInfo = e.detail.userInfo;
    if (userInfo) {
      const user = new User();
      user.update(userInfo)
        .then(res => {
          const userInfo = res.data.user;
          app.globalData.userInfo = userInfo; // 更新用户信息
          this.setData({
            userInfo
          })
          this.setUserStatus(userInfo);
        })
    }
  },

  // 跳转到实名认证页面
  navigateToRealname: function() {
    if (!this.data.isRealname) {
      wx.navigateTo({
        url: '/pages/realname/realname'
      })
    }
  },

  // 跳转到车主认证页面
  navigateToDriver: function() {
    // null 未审核 0 等待审核 1 审核成功 2 审核失败
    const driverAuditStatus = this.data.driverAuditStatus;
    // 只有是未审核状态才会跳转到审核页
    if (!this.data.isDriver && driverAuditStatus === 'unaudited') {
      wx.navigateTo({
        url: '/pages/driver/driver'
      })
    }
  }
})
