import { SEATS, LOCATION, ROLE_TYPES, TRIP_TYPES, DRIVER_AUDIT_STATUS } from '../../utils/constants';
import { isError, formatTime } from '../../utils/util';
import { User } from '../../utils/user';
import { Auth } from '../../utils/auth';
import { Publish } from './publish-model';

const app = getApp(); //获取应用实例
const auth = new Auth(); // 获取权限实例

Page({
  data: {
    trip: {
      type: 1, // 1 人找车 2 车找人
      fromName: '出发地', // 出发地名称
      fromAddress: '', // 出发地地址
      fromLongitude: '', // 出发地经度
      fromLatitude: '', // 出发地纬度
      destName: '目的地', // 名称
      destAddress: '', // 地址
      destLongitude: '', // 经度
      destLatitude: '', // 纬度
      startTime: '最早出发时间',
      endTime: '最晚出发时间',
      passageCount: 1, // 座位/人数
      remarks: '', // 备注
      date: '出发日期', // 日期
      earliestTime: '最早出发时间',
      latestTime: '最晚出发时间'
    },
    userInfo: null,
    SEATS,
    tripTypes: Object.values(TRIP_TYPES), // 对象属性值的数组
    today: formatTime().date,
    maxday: formatTime(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).date,
    isAgree: false,
    showTopTips: false,
    errorMsg: ''
  },

  onLoad() {},

  onShow() {
    this.__getUserInfo().then(() => {
      this.checkAuth();
    })
  },

  // 获取用户信息
  __getUserInfo() {
    const promise = new Promise((resolve, reject) => {
      const userInfo = app.globalData.userInfo;
      if (userInfo) { // 当用户通过正常的跳转进入该页面(用户信息已经获取并存储在globalData中)
        this.setData({ userInfo })
        resolve();
      } else { // 当用户直接进入该页面(通过二维码或者分享链接)
        app.userInfoCallback = userInfo => { // 这是个异步过程
          this.setData({ userInfo })
          resolve();
        }
      }
    })
    return promise;
  },

  // 校验权限
  checkAuth() {
    const result = auth.checkAuth('publish', 'publish', this.data.trip.type);
  },

  // 行程类型
  bindTripTypeChange(e) {
    let tripTypes = this.data.tripTypes;
    const value = e.detail.value; // string
    for (var i = 0, len = tripTypes.length; i < len; ++i) {
      tripTypes[i].checked = tripTypes[i].value == e.detail.value;
    }
    this.setData({
      ['trip.type']: value,
      tripTypes: tripTypes
    });
  },

  // 重置行程type
  __resetTripType() {
    let tripTypes = this.data.tripTypes;
    for (var i = 0, len = tripTypes.length; i < len; ++i) {
      tripTypes[i].checked = false;
    }
    tripTypes[0].checked = true;
    this.setData({
      ['trip.type']: 1,
      tripTypes: tripTypes
    });
  },

  // 获取地址
  bindChooseLocation(e) {
    const that = this;
    wx.chooseLocation({
      success: function(res) {
        const key = `trip.${e.currentTarget.id}`,
          name = `${key}Name`,
          address = `${key}Address`,
          longitude = `${key}Longitude`,
          latitude = `${key}Latitude`;
        that.setData({
          [name]: res.name,
          [address]: res.address,
          [longitude]: res.longitude,
          [latitude]: res.latitude
        });
      },
      fail: function(error) {
        console.log(error);
      }
    })
  },

  // 选择座位
  bindSeatChange(e) {
    const value = Number(e.detail.value) + 1;
    this.setData({
      ['trip.passageCount']: value
    })
  },

  // 公共方法
  bindPickerChange(e) {
    const id = e.target.id;
    let value = e.detail.value;
    const key = `trip.${e.target.id}`;
    this.setData({
      [key]: value // ID 对应 key值
    })
  },

  // 同意协议
  bindAgreeChange: function(e) {
    this.setData({
      isAgree: !!e.detail.value.length
    })
  },

  // 提交表单
  bindFormSubmit: function(e) {
    if (this.valid()) {
      this.publish();
    }
  },

  // 校验字段合法性
  valid() {
    const trip = this.data.trip;

    if (trip.fromAddress === '') {
      isError('请选择出发地', this);
      return false;
    }

    if (trip.destAddress === '') {
      isError('请选择目的地', this);
      return false;
    }

    if (trip.date === '出发日期') {
      isError('请选择出发日期', this);
      return false;
    }

    if (trip.earliestTime === '最早出发时间') {
      isError('请选择最早出发时间', this);
      return false;
    }

    if (trip.latestTime === '最晚出发时间') {
      isError('请选择最晚出发时间', this);
      return false;
    }
    trip.startTime = `${trip.date } ${trip.earliestTime}:00`;
    trip.endTime = `${trip.date} ${trip.latestTime}:00`;
    return true;
  },

  // 发布
  publish: function() {
    wx.showLoading({
      title: '发布中',
      mask: true
    });

    const publish = new Publish();
    publish.createTrip(this.data.trip)
      .then(res => {
        wx.showToast({
          title: '发布成功'
        })
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/trips/trips'
          })
        }, 1500)
      })
      .catch(error => {
        wx.hideLoading();
        console.log(error);
      })
  },
})
