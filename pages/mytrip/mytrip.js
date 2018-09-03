// pages/mytrip/mytrip.js
import {
  Mytrip
} from './mytrip-model.js';
import {
  PAGESIZE
} from '../../utils/constants.js';

Page({
  data: {
    currentPage: 1,
    pageSize: PAGESIZE,
    totalCount: 0,
    totalPage: 1,
    trips: []
  },
  onReady: function() {
    this.fetchMyTrips();
  },
  /**
   *  从缓存中读取行程数据
   */
  fetchMyTrips: function() {
    let mytrip = new Mytrip();
    mytrip.getMyTrips(res => {
      console.log('this', this);
      console.log('res', res);
    });
  }
})