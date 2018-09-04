import { Trips } from './trips-model';
import { TRIP_TYPES } from '../../utils/constants';
import { Auth } from '../../utils/auth';
import { readyUser } from '../../utils/readyUser';
import { PAGESIZE } from '../../utils/constants';

const app = getApp();

Page({
  data: {
    userInfo: null,
    showDialogUserInfo: false,
    params: {
      destCityCode: '', // 目的地城市代码,非必填
      type: 1, // 1. 人找车 2. 车找人
      pageSize: PAGESIZE, // 每页数量
      currentPage: 1, // 当前页
      orderReg: 'start_time ASC', //排序规则,非必填
    },
    driverTrips: [], // 车主行程列表
    passengerTrips: [], // 乘客行程列表
    tripTypes: Object.values(TRIP_TYPES), // 类型
    totalCount: 0, // 总条数
    totalPage: 1 // 总页数
  },

  onLoad: function(options) {
    this.__getUserInfo().then(userInfo => {
      this.setData({
        userInfo
      })
    })
  },

  onShow() {
    this.__getCity(); // 获取城市信息
  },

  onHide() {
    wx.removeStorageSync('city');
  },

  // 获取用户信息 - 异步
  __getUserInfo() {
    return readyUser();
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this._resetParams();
    this.getTripsFromServer();
  },

  // 页面上拉触底事件的处理函数
  onReachBottom: function() {
    this._loadMore();
  },

  // 获取行程
  getTripsFromServer: function() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    const type = this.data.params.type;
    const tripType = type === 1 ? 'passengerTrips' : 'driverTrips';
    const trips = new Trips();
    const params = this.data.params;
    trips.query(params).then(res => {
      const data = res.data;
      let trips = data.list
      // 如果是第一页数据
      if (this.data.params.currentPage > 1) {
        trips = [...this.data[tripType], ...trips];
      }
      this.setData({
        [tripType]: trips,
        totalCount: data.totalCount,
        totalPage: data.totalPage
      });
      wx.hideLoading();
      wx.stopPullDownRefresh();
    })
  },

  // 加载更多数据
  _loadMore: function() {
    let currentPage = this.data.params.currentPage;
    if (currentPage < this.data.totalPage) {
      currentPage++
      this.setData({
        ['params.currentPage']: currentPage
      })
      this.getTripsFromServer();
    }
  },

  // 重置查询条件
  _resetParams: function() {
    this.setData({
      ['params.currentPage']: 1
    })
  },

  // Tab 切换
  tabClick: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      ['params.type']: type
    });
    if (type === 1 && this.data.passengerTrips.length === 0) {
      this.getTripsFromServer();
    }
    if (type === 2 && this.data.driverTrips.length === 0) {
      this.getTripsFromServer();
    }
  },

  // 跳转到发布页面
  toPublish() {
    wx.switchTab({
      url: '/pages/publish/publish'
    })
  },

  // 获取城市信息
  __getCity() {
    const city = wx.getStorageSync('city');
    let title = '行程',
      code = '';
    if (city) {
      title = city.name;
      code = city.code;
    }
    // 设置标题
    wx.setNavigationBarTitle({ title })
    // 按目的地查询
    this.setData({
      ['params.destCityCode']: code
    })
    this.getTripsFromServer();
  },

  // 校验权限
  checkAuth(action) {
    const auth = new Auth();
    return auth.checkAuth(action);
  },

  // 打电话
  onCall(e) {
    const phoneNumber = e.detail.phoneNumber,
      type = e.detail.type;
    const pass = this.checkAuth('trips', 'call', type);
    if (pass) {
      wx.makePhoneCall({ phoneNumber })
    }
  }
})
