import { IdentityCodeValid, fullnameValid } from '../../utils/regexp';
import { isError } from '../../utils/util';
import { Realname } from './realname-model';
import { getAge } from '../../utils/age';
import { ROLE_TYPES } from '../../utils/constants';

const app = getApp();

Page({
  data: {
    userInfo: null,
    showUserDialog: false,
    name: '', // 姓名
    idCard: '', // 身份证号码
    errorMsg: '', // 错误信息
    showTopTips: false, // 显示错误信息
    callTimes: wx.getStorageSync('realnameCallable')
  },

  onLoad: function(options) {
    console.log('onLoad')
  },

  onShow: function() {
    console.log('onShow')
    this.__setUserInfo();
    this.__checkAuth();
  },

  __checkAuth() {
    const roleDesc = ROLE_TYPES[this.data.userInfo.role].name;
    if (roleDesc === 'WX_USER') {
      this.setData({ showUserDialog: true })
    }

    if (roleDesc === 'USER_ROLE_WITH_NICKNAME') {
      wx.showModal({
        title: '提示',
        content: '请先验证手机号码',
        confirmText: '去验证',
        success: res => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/phone/phone?page=realname' })
          } else if (res.cancel) {
            wx.switchTab({ url: '/pages/home/home' })
          }
        }
      })
    }
  },

  // 获取全局用户信息
  __setUserInfo() {
    this.setData({ userInfo: app.globalData.userInfo })
  },

  // 用户更新
  onUserUpdate(e) {
    const userInfo = e.detail.user;
    app.globalData.userInfo = userInfo; // 更新app用户信息
    this.setData({ userInfo, showUserDialog: false });  // 更新本上下文用户信息
    this.__checkAuth();
  },

  // 输入事件
  bindInput: function(e) {
    this.setData({
      [e.target.id]: e.detail.value
    })
  },

  // 提交表单
  formSubmit(e) {
    const value = e.detail.value;
    const name = value.name;
    const idCard = value.idCard;
    if (!fullnameValid(name)) {
      isError('你的名字有问题', this);
      return false;
    }
    if (!IdentityCodeValid(idCard)) {
      isError('你的身份证号码有问题', this);
      return false;
    }

    if (getAge(idCard) < 18) {
      isError('你还未满18周岁以上', this);
      return false;
    }

    if (getAge(idCard) > 60) {
      isError('您已超过60周岁以上', this);
      return false;
    }

    const realname = new Realname();
    realname.binding({
      name,
      idCard
    }).then(res => {
      app.globalData.userInfo = res.data.user;
      wx.navigateBack({
        delta: 1
      })
    })
  }
})
