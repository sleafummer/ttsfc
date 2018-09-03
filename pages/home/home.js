import { Home } from './home-model.js';
import { HOT_CITY } from '../../utils/constants.js';
const home = new Home();

Page({
  data: {
    hotcitys: HOT_CITY
  },

  onLoad: function(options) {},

  toTrips(e) {
    const city = e.currentTarget.dataset.city;
    wx.setStorageSync('city', city);
    wx.switchTab({
      url: '/pages/trips/trips'
    })
  },

  // 转发
  onShareAppMessage(options) {
    return {
      title: '唐唐顺风车',
      path: '/pages/home/home'
    }
  },
})
