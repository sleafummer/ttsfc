import { Mytrip } from './mytrip-model';
import { PAGESIZE } from '../../utils/constants';
import { TRIP_TYPES } from '../../utils/constants';
import { readyUser } from '../../utils/readyUser';

const app = getApp();

Page({
  data: {
    params: {
      type: 1, // 1. 人找车 2. 车找人
      pageSize: PAGESIZE, // 每页数量
      currentPage: 1, // 当前页
      orderReg: 'start_time ASC', //排序规则,非必填
    },
    driverTrips: [], // 车找人行程列表
    passengerTrips: [], // 人找车行程列表
    tripTypes: Object.values(TRIP_TYPES), // 类型
    totalCount: 0, // 总条数
    totalPage: 1, // 总页数
    userInfo: null // 当前用户信息
  },

  onReady() {
    // 获取用户信息
    readyUser().then(userInfo => {
      this.setData({ userInfo })
      this.fetchMyTrips();
    })
  },

  // 从服务器获取个人行程列表
  fetchMyTrips(params = this.data.params) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    const type = this.data.params.type;
    const tripType = type === 1 ? 'passengerTrips' : 'driverTrips';
    const mytrip = new Mytrip();
    mytrip.query(params)
      .then(res => {
        const data = res.data;
        // 个人行程列表不包含用户信息
        let trips = data.list.map(trip => {
          trip.user = this.data.userInfo;
          return trip;
        })
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
      })
  },

  // Tab 切换
  tabClick: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      ['params.type']: type
    });
    if (type === 1 && this.data.passengerTrips.length === 0) {
      this.fetchMyTrips();
    }
    if (type === 2 && this.data.driverTrips.length === 0) {
      this.fetchMyTrips();
    }
  },

  // 页面上拉触底事件的处理函数
  onReachBottom: function() {
    this._loadMore();
  },

  // 加载更多数据
  _loadMore: function() {
    let currentPage = this.data.params.currentPage;
    if (currentPage < this.data.totalPage) {
      currentPage++
      this.setData({
        ['params.currentPage']: currentPage
      })
      this.fetchMyTrips();
    }
  },
})
