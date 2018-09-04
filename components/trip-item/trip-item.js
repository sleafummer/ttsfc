Component({
  /**
   * 组件的属性列表
   */
  properties: {
    trip: {
      type: Object,
      value: {},
      observer: function(newVal, oldVal, changedPath) {
        // console.log(newVal, oldVal, changedPath)
      }
    },
    isMy: {
      type: Boolean,
      value: false
    },
    currentUser: {
      type: Object,
      value: {},
      observer: function(newVal, oldVal, changedPath) {
      }
    }
  },

  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    // 打电话
    bindCall: function(e) {
      this.triggerEvent('call', { phoneNumber: this.data.trip.user.phone, type: this.data.trip.type });
    },

    // 打开出发地地图
    bindFromMap: function(e) {
      const trip = this.data.trip;
      const map = {
        latitude: trip.fromLatitude,
        longitude: trip.fromLongitude,
        name: trip.fromName,
        address: trip.fromAddress
      }
      this.triggerEvent('map', { map });
    },

    // 打开目的地地图
    bindDestMap: function() {
      const trip = this.data.trip;
      const map = {
        latitude: trip.destLatitude,
        longitude: trip.destLongitude,
        name: trip.destName,
        address: trip.destAddress
      }
      this.triggerEvent('map', { map });
    },

    // 跳转到行程详情
    toDetail() {
      wx.setStorageSync('trip', this.data.trip);
      wx.navigateTo({
        url: `/pages/trip/trip?tripCode=${this.data.trip.tripCode}`
      })
    }
  }
})
